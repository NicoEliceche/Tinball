import { Prisma } from '@prisma/client';
import { RegisterTournamentSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { sha256 } from '../../core/security/crypto.js';
import { featureFlags } from '../../core/security/featureFlags.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const Params = z.object({ id: z.string().min(1) });

export async function tournamentRoutes(app: FastifyInstance) {
  app.get('/api/v1/tournaments/:id', { preHandler: requireOnboarded }, async (request) => {
    const { id } = Params.parse(request.params);
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        entries: { where: { status: { in: ['PENDING', 'CONFIRMED', 'CHAMPION'] } }, include: { team: { select: { id: true, name: true, crestUrl: true, crestColor: true, rankPoints: true } } }, orderBy: { createdAt: 'asc' } },
        games: { include: { match: { include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } } }, orderBy: [{ round: 'asc' }, { bracketSlot: 'asc' }] },
      },
    });
    if (!tournament) throw notFound('Torneo');
    return { ...tournament, paidCompetitionsEnabled: featureFlags.prizeLobbies };
  });

  app.post('/api/v1/tournaments/:id/register', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = Params.parse(request.params);
    const input = RegisterTournamentSchema.parse(request.body);
    const operation = `tournament.register:${id}`;
    const requestHash = sha256(JSON.stringify({ id, ...input }));
    const response = await prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({ where: { userId_key_operation: { userId: request.auth!.userId, key: input.idempotencyKey, operation } } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('La clave de idempotencia ya fue usada con otros datos.');
        if (replay.responseBody) return replay.responseBody;
        throw conflict('La solicitud original todavía está en proceso.');
      }
      const tournament = await tx.tournament.findUnique({ where: { id }, include: { _count: { select: { entries: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } } } } } });
      if (!tournament) throw notFound('Torneo');
      if ((tournament.entryFeeMinor > 0 || tournament.prizePoolMinor > 0) && !featureFlags.prizeLobbies) throw forbidden('Los torneos con inscripción o premios permanecen deshabilitados hasta completar validación legal y pagos seguros.');
      const now = new Date();
      if (tournament.status !== 'REGISTRATION_OPEN' || tournament.registrationOpensAt > now || tournament.registrationClosesAt <= now) throw conflict('La inscripción no está abierta.');
      if (tournament._count.entries >= tournament.maxTeams) throw conflict('El torneo alcanzó el límite de equipos.');
      const team = await tx.team.findUnique({ where: { id: input.teamId }, include: { members: { where: { status: 'ACTIVE' }, select: { userId: true, role: true } } } });
      if (!team) throw notFound('Equipo');
      if (team.format !== tournament.format) throw conflict('El formato del equipo no coincide con el torneo.');
      const manager = team.members.find((member) => member.userId === request.auth!.userId && (member.role === 'CAPTAIN' || member.role === 'ADMIN'));
      if (!manager) throw forbidden('Sólo el capitán o un administrador puede inscribir al equipo.');
      if (team.members.length < 2 || team.members.length > tournament.rosterLimit) throw conflict('El plantel no cumple con el límite del torneo.');
      const entry = await tx.tournamentEntry.upsert({ where: { tournamentId_teamId: { tournamentId: id, teamId: team.id } }, create: { tournamentId: id, teamId: team.id, submittedById: request.auth!.userId, status: 'PENDING', rosterSnapshot: { userIds: team.members.map((member) => member.userId), capturedAt: now.toISOString() } }, update: { status: 'PENDING', rosterSnapshot: { userIds: team.members.map((member) => member.userId), capturedAt: now.toISOString() } } });
      const result = JSON.parse(JSON.stringify({ entry, paymentRequired: tournament.entryFeeMinor > 0, entryFeeMinor: tournament.entryFeeMinor, currency: tournament.currency })) as Prisma.InputJsonObject;
      await tx.idempotencyRecord.create({ data: { userId: request.auth!.userId, key: input.idempotencyKey, operation, requestHash, responseCode: 201, responseBody: result, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'tournament.register', outcome: 'success', targetType: 'tournament', targetId: id, requestId: request.id, ip: request.ip, metadata: { teamId: input.teamId } });
    return reply.code(201).send(response);
  });
}
