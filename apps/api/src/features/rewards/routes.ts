import { Prisma } from '@prisma/client';
import { RedeemRewardSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { sha256 } from '../../core/security/crypto.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const Params = z.object({ id: z.string().min(1) });

export async function rewardRoutes(app: FastifyInstance) {
  app.post('/api/v1/rewards/:id/redeem', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = Params.parse(request.params);
    const input = RedeemRewardSchema.parse(request.body);
    const operation = `reward.redeem:${id}`;
    const requestHash = sha256(JSON.stringify({ id, ...input }));
    const response = await prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({ where: { userId_key_operation: { userId: request.auth!.userId, key: input.idempotencyKey, operation } } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('La clave de idempotencia ya fue usada con otros datos.');
        if (replay.responseBody) return replay.responseBody;
        throw conflict('La solicitud original todavía está en proceso.');
      }
      const now = new Date();
      const reward = await tx.reward.findFirst({ where: { id, active: true, stock: { gt: 0 }, OR: [{ startsAt: null }, { startsAt: { lte: now } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] } });
      if (!reward) throw notFound('Recompensa disponible');
      const latest = await tx.pointsLedgerEntry.findFirst({ where: { userId: request.auth!.userId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { balanceAfter: true } });
      const currentBalance = latest?.balanceAfter ?? 0;
      if (currentBalance < reward.pointsCost) throw conflict('No tenés puntos suficientes para este canje.');
      const stockUpdate = await tx.reward.updateMany({ where: { id: reward.id, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } });
      if (stockUpdate.count !== 1) throw conflict('La recompensa se quedó sin stock.');
      const redemption = await tx.rewardRedemption.create({ data: { rewardId: reward.id, userId: request.auth!.userId, pointsSpent: reward.pointsCost, idempotencyKey: input.idempotencyKey, status: 'PENDING' } });
      const balanceAfter = currentBalance - reward.pointsCost;
      await tx.pointsLedgerEntry.create({ data: { userId: request.auth!.userId, kind: 'REDEMPTION', delta: -reward.pointsCost, balanceAfter, referenceType: 'redemption', referenceId: redemption.id, idempotencyKey: input.idempotencyKey } });
      const result = JSON.parse(JSON.stringify({ redemption, balanceAfter })) as Prisma.InputJsonObject;
      await tx.idempotencyRecord.create({ data: { userId: request.auth!.userId, key: input.idempotencyKey, operation, requestHash, responseCode: 201, responseBody: result, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'reward.redeem', outcome: 'success', targetType: 'reward', targetId: id, requestId: request.id, ip: request.ip });
    return reply.code(201).send(response);
  });
}
