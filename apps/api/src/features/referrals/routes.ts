import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { ClaimReferralSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { conflict, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { hashPrivateValue } from '../../core/security/crypto.js';
import { featureFlags } from '../../core/security/featureFlags.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

function randomReferralCode(): string {
  return randomBytes(5).toString('hex').toUpperCase();
}

export async function referralRoutes(app: FastifyInstance) {
  app.get('/api/v1/referrals/me', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const codes = await prisma.referralCode.findMany({ where: { ownerId: request.auth.userId }, include: { referrals: { select: { status: true, pointsAwarded: true, createdAt: true, invitee: { select: { displayName: true } } }, orderBy: { createdAt: 'desc' }, take: 100 } }, orderBy: { createdAt: 'desc' } });
    return { codes, cashPayoutsEnabled: featureFlags.referralPayouts };
  });

  app.post('/api/v1/referrals/code', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const existing = await prisma.referralCode.findFirst({ where: { ownerId: request.auth.userId, active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, orderBy: { createdAt: 'desc' } });
    if (existing) return existing;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const created = await prisma.referralCode.create({ data: { ownerId: request.auth.userId, code: randomReferralCode() } });
        await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'referral.code.create', outcome: 'success', targetType: 'referralCode', targetId: created.id, requestId: request.id, ip: request.ip });
        return reply.code(201).send(created);
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
      }
    }
    throw conflict('No se pudo generar el código. Intentá nuevamente.');
  });

  app.post('/api/v1/referrals/claim', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = ClaimReferralSchema.parse(request.body);
    const referral = await prisma.$transaction(async (tx) => {
      const code = await tx.referralCode.findUnique({ where: { code: input.code }, include: { _count: { select: { referrals: true } } } });
      if (!code || !code.active || (code.expiresAt && code.expiresAt <= new Date())) throw notFound('Código de referido');
      if (code.ownerId === request.auth!.userId) throw conflict('No podés usar tu propio código.');
      if (code.maxUses != null && code._count.referrals >= code.maxUses) throw conflict('El código alcanzó su límite de usos.');
      const previous = await tx.referral.findUnique({ where: { inviteeId: request.auth!.userId } });
      if (previous) {
        if (previous.codeId === code.id) return previous;
        throw conflict('Tu cuenta ya tiene un referido asociado.');
      }
      return tx.referral.create({ data: { codeId: code.id, ownerId: code.ownerId, inviteeId: request.auth!.userId, fingerprintHash: hashPrivateValue(request.ip), status: 'REGISTERED' } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'referral.claim', outcome: 'success', targetType: 'referral', targetId: referral.id, requestId: request.id, ip: request.ip });
    return reply.code(201).send(referral);
  });
}
