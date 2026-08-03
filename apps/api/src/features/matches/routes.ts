import { randomInt, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { MatchCheckInSchema, MatchResultSchema, RecordNoShowSchema, UpdateLineupSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { hashSessionToken, safeEqual, sha256 } from '../../core/security/crypto.js';
import { checkInRateLimit, mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const IdParams = z.object({ id: z.string().min(1) });
const NoShowParams = z.object({ id: z.string().min(1), userId: z.string().min(1) });
const startersByFormat = { FIVE_A_SIDE: 5, SEVEN_A_SIDE: 7, EIGHT_A_SIDE: 8, ELEVEN_A_SIDE: 11 } as const;

export function calculateEloDelta(ownRank: number, opponentRank: number, actual: 0 | 0.5 | 1): { delta: number; expected: number } {
  const expected = 1 / (1 + 10 ** ((opponentRank - ownRank) / 400));
  const rawDelta = Math.round(32 * (actual - expected));
  const delta = actual === 1 ? Math.max(1, rawDelta) : actual === 0 ? Math.min(-1, rawDelta) : rawDelta;
  return { delta, expected };
}

async function canManageMatch(match: { creatorId: string; homeTeamId: string | null; awayTeamId: string | null }, userId: string): Promise<boolean> {
  if (match.creatorId === userId) return true;
  if (!match.homeTeamId && !match.awayTeamId) return false;
  const membership = await prisma.teamMember.findFirst({ where: { teamId: { in: [match.homeTeamId, match.awayTeamId].filter((teamId): teamId is string => Boolean(teamId)) }, userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } }, select: { id: true } });
  return Boolean(membership);
}

export async function applyVerifiedMatchRewards(tx: Prisma.TransactionClient, input: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  participants: Array<{ userId: string; side: string | null; checkedInAt: Date | null }>;
}): Promise<void> {
  const attended = input.participants.filter((participant) => participant.checkedInAt && (participant.side === 'HOME' || participant.side === 'AWAY'));
  if (attended.length === 0) return;
  const now = new Date();
  const startsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const period = await tx.rankingPeriod.upsert({
    where: { kind_startsAt_endsAt: { kind: 'MONTHLY', startsAt, endsAt } },
    create: { kind: 'MONTHLY', startsAt, endsAt },
    update: {},
  });
  const userIds = attended.map((participant) => participant.userId);
  const [entries, profiles, subscriptions] = await Promise.all([
    tx.rankingEntry.findMany({ where: { periodId: period.id, userId: { in: userIds } }, select: { userId: true, points: true } }),
    tx.playerProfile.findMany({ where: { userId: { in: userIds } }, select: { userId: true, locality: true } }),
    tx.subscription.findMany({ where: { userId: { in: userIds }, status: 'ACTIVE', currentPeriodEnd: { gt: now } }, select: { userId: true } }),
  ]);
  const rankBefore = new Map(entries.map((entry) => [entry.userId, entry.points]));
  const localityByUser = new Map(profiles.map((profile) => [profile.userId, profile.locality]));
  const premiumUsers = new Set(subscriptions.map((subscription) => subscription.userId));
  const homePlayers = attended.filter((participant) => participant.side === 'HOME');
  const awayPlayers = attended.filter((participant) => participant.side === 'AWAY');

  for (const participant of attended) {
    const ownRank = rankBefore.get(participant.userId) ?? 1000;
    const opponents = participant.side === 'HOME' ? awayPlayers : homePlayers;
    if (opponents.length > 0) {
      const opponentRank = opponents.reduce((total, opponent) => total + (rankBefore.get(opponent.userId) ?? 1000), 0) / opponents.length;
      const won = participant.side === 'HOME' ? input.homeScore > input.awayScore : input.awayScore > input.homeScore;
      const drew = input.homeScore === input.awayScore;
      const actual = drew ? 0.5 : won ? 1 : 0;
      const { delta, expected } = calculateEloDelta(ownRank, opponentRank, actual);
      const balanceAfter = Math.max(0, ownRank + delta);
      const kind = drew ? 'DRAW' as const : won ? 'WIN' as const : 'LOSS' as const;
      await tx.rankingEntry.upsert({
        where: { periodId_userId: { periodId: period.id, userId: participant.userId } },
        create: { periodId: period.id, userId: participant.userId, locality: localityByUser.get(participant.userId) ?? 'Sin localidad', points: balanceAfter, matches: 1, wins: won ? 1 : 0, draws: drew ? 1 : 0, losses: !won && !drew ? 1 : 0 },
        update: { locality: localityByUser.get(participant.userId) ?? 'Sin localidad', points: balanceAfter, position: null, matches: { increment: 1 }, wins: { increment: won ? 1 : 0 }, draws: { increment: drew ? 1 : 0 }, losses: { increment: !won && !drew ? 1 : 0 } },
      });
      await tx.rankingEvent.create({ data: { periodId: period.id, userId: participant.userId, matchId: input.matchId, kind, delta, balanceAfter, idempotencyKey: randomUUID(), metadata: { algorithm: 'elo-v1', kFactor: 32, opponentAverage: Math.round(opponentRank), expected: Number(expected.toFixed(4)) } } });
    }

    const lastPoints = await tx.pointsLedgerEntry.findFirst({ where: { userId: participant.userId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { balanceAfter: true } });
    const loyaltyDelta = premiumUsers.has(participant.userId) ? 150 : 100;
    await tx.pointsLedgerEntry.create({ data: { userId: participant.userId, kind: 'MATCH_PLAYED', delta: loyaltyDelta, balanceAfter: (lastPoints?.balanceAfter ?? 0) + loyaltyDelta, referenceType: 'match', referenceId: input.matchId, idempotencyKey: randomUUID(), metadata: { premiumMultiplier: premiumUsers.has(participant.userId) ? 1.5 : 1 } } });
    await tx.notification.create({ data: { userId: participant.userId, category: 'RANKING', title: 'Resultado verificado', body: `Tu partido quedó confirmado. Sumaste ${loyaltyDelta} puntos canjeables.`, data: { matchId: input.matchId } } });
  }
}

export async function matchRoutes(app: FastifyInstance) {
  app.get('/api/v1/matches/me', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const items = await prisma.match.findMany({ where: { participants: { some: { userId: request.auth.userId } } }, include: { homeTeam: { select: { name: true, members: { where: { userId: request.auth.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } }, select: { id: true } } } }, awayTeam: { select: { name: true, members: { where: { userId: request.auth.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } }, select: { id: true } } } }, venue: { select: { name: true } }, participants: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } }, lineupEntries: { select: { userId: true, isStarter: true } } }, orderBy: { startsAt: 'desc' }, take: 50 });
    const conversations = await prisma.conversation.findMany({ where: { kind: 'MATCH', scopeRefId: { in: items.map((item) => item.id) }, members: { some: { userId: request.auth.userId, leftAt: null } } }, select: { id: true, scopeRefId: true } });
    const conversationByMatch = new Map(conversations.map((conversation) => [conversation.scopeRefId, conversation.id]));
    return { items: items.map((match) => ({ ...match, homeTeam: match.homeTeam ? { name: match.homeTeam.name } : null, awayTeam: match.awayTeam ? { name: match.awayTeam.name } : null, canManage: match.creatorId === request.auth!.userId || Boolean(match.homeTeam?.members.length || match.awayTeam?.members.length), conversationId: conversationByMatch.get(match.id) ?? null })) };
  });
  app.get('/api/v1/matches/:id', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized(); const { id } = IdParams.parse(request.params);
    const match = await prisma.match.findUnique({ where: { id }, include: { homeTeam: true, awayTeam: true, venue: true, participants: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } }, lineupEntries: true } });
    if (!match) throw notFound('Partido');
    const member = match.creatorId === request.auth.userId || match.participants.some((participant) => participant.userId === request.auth!.userId);
    if (!member) throw forbidden();
    return match;
  });
  app.post('/api/v1/matches/:id/confirm', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized(); const { id } = IdParams.parse(request.params);
    const updated = await prisma.matchParticipant.updateMany({ where: { matchId: id, userId: request.auth.userId, status: { in: ['INVITED', 'REQUESTED'] } }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
    if (updated.count !== 1) throw conflict('No hay una invitación pendiente para confirmar.');
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.attendance.confirm', outcome: 'success', targetType: 'match', targetId: id, requestId: request.id, ip: request.ip });
    return { status: 'CONFIRMED' };
  });
  app.post('/api/v1/matches/:id/check-in-code', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = IdParams.parse(request.params);
    const match = await prisma.match.findUnique({ where: { id }, select: { id: true, creatorId: true, homeTeamId: true, awayTeamId: true, startsAt: true, status: true } });
    if (!match) throw notFound('Partido');
    if (!(await canManageMatch(match, request.auth.userId))) throw forbidden('Sólo la organización puede generar el código de asistencia.');
    const hoursUntilStart = (match.startsAt.getTime() - Date.now()) / 3_600_000;
    if (hoursUntilStart > 24 || hoursUntilStart < -1 || !['CALLING', 'CONFIRMED', 'LIVE'].includes(match.status)) throw conflict('El código se habilita desde 24 horas antes y hasta una hora después del inicio.');
    const code = randomInt(100_000, 1_000_000).toString();
    await prisma.match.update({ where: { id }, data: { checkInCodeHash: hashSessionToken(`checkin:${id}:${code}`) } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.checkin_code.rotate', outcome: 'success', targetType: 'match', targetId: id, requestId: request.id, ip: request.ip });
    return { code, validUntil: new Date(match.startsAt.getTime() + 45 * 60 * 1000).toISOString() };
  });
  app.post('/api/v1/matches/:id/check-in', { preHandler: [requireOnboarded, checkInRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = IdParams.parse(request.params);
    const input = MatchCheckInSchema.parse(request.body);
    const match = await prisma.match.findUnique({ where: { id }, include: { participants: { where: { userId: request.auth.userId }, select: { id: true, status: true, checkedInAt: true } } } });
    if (!match) throw notFound('Partido');
    const participant = match.participants[0];
    if (!participant || !['CONFIRMED', 'ATTENDED'].includes(participant.status)) throw forbidden('No tenés asistencia confirmada en este partido.');
    if (participant.checkedInAt) return { status: 'ATTENDED', checkedInAt: participant.checkedInAt };
    const now = new Date();
    if (now < new Date(match.startsAt.getTime() - 60 * 60 * 1000) || now > new Date(match.startsAt.getTime() + 45 * 60 * 1000)) throw conflict('Estás fuera de la ventana de check-in.');
    if (!match.checkInCodeHash || !safeEqual(match.checkInCodeHash, hashSessionToken(`checkin:${id}:${input.code}`))) throw forbidden('El código de asistencia no es válido.');
    const updated = await prisma.matchParticipant.update({ where: { id: participant.id }, data: { status: 'ATTENDED', checkedInAt: now } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.checkin', outcome: 'success', targetType: 'match', targetId: id, requestId: request.id, ip: request.ip });
    return { status: updated.status, checkedInAt: updated.checkedInAt };
  });
  app.put('/api/v1/matches/:id/lineup', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = IdParams.parse(request.params);
    const input = UpdateLineupSchema.parse(request.body);
    const match = await prisma.match.findUnique({ where: { id }, include: { participants: { where: { side: input.side }, select: { userId: true } } } });
    if (!match) throw notFound('Partido');
    if (['LIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'].includes(match.status)) throw conflict('La formación ya no puede modificarse.');
    const teamId = input.side === 'HOME' ? match.homeTeamId : match.awayTeamId;
    if (teamId) {
      const manager = await prisma.teamMember.findFirst({ where: { teamId, userId: request.auth.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } }, select: { id: true } });
      if (!manager) throw forbidden('Sólo el capitán o un administrador puede armar la formación.');
    } else if (match.creatorId !== request.auth.userId) {
      throw forbidden('Sólo el organizador puede armar la formación de un partido informal.');
    }
    const participantIds = new Set(match.participants.map((participant) => participant.userId));
    if (input.entries.some((entry) => !participantIds.has(entry.userId))) throw conflict('La formación contiene jugadores que no confirmaron para ese lado.');
    if (input.entries.filter((entry) => entry.isStarter).length > startersByFormat[match.format]) throw conflict('Hay más titulares que lugares disponibles para el formato.');
    await prisma.$transaction([
      prisma.matchLineupEntry.deleteMany({ where: { matchId: id, side: input.side } }),
      prisma.matchLineupEntry.createMany({ data: input.entries.map((entry) => ({ matchId: id, side: input.side, ...entry })) }),
    ]);
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.lineup.update', outcome: 'success', targetType: 'match', targetId: id, requestId: request.id, ip: request.ip, metadata: { side: input.side, playerCount: input.entries.length } });
    return { side: input.side, entries: input.entries };
  });
  app.post('/api/v1/matches/:id/result', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = IdParams.parse(request.params);
    const input = MatchResultSchema.parse(request.body);
    const operation = `match.result.submit:${id}`;
    const requestHash = sha256(JSON.stringify({ id, ...input }));
    const result = await prisma.$transaction(async (tx) => {
      const replay = await tx.idempotencyRecord.findUnique({ where: { userId_key_operation: { userId: request.auth!.userId, key: input.idempotencyKey, operation } } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('La clave de idempotencia ya fue usada con otros datos.');
        if (replay.responseBody) return replay.responseBody;
        throw conflict('La solicitud original todavía está en proceso.');
      }

      const match = await tx.match.findUnique({
        where: { id },
        include: {
          homeTeam: { include: { members: { where: { userId: request.auth!.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } } } } },
          awayTeam: { include: { members: { where: { userId: request.auth!.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } } } } },
          participants: { select: { userId: true, side: true, checkedInAt: true } },
        },
      });
      if (!match) throw notFound('Partido');
      if (!['LIVE', 'COMPLETED'].includes(match.status)) throw conflict('El resultado sólo puede cargarse al finalizar el partido.');
      if (match.resultStatus === 'CONFIRMED') throw conflict('El resultado ya fue confirmado por ambos equipos.');
      if (match.resultStatus === 'DISPUTED') throw conflict('El resultado está en revisión y ya no puede editarse.');

      const participantSide = match.participants.find((participant) => participant.userId === request.auth!.userId)?.side;
      const side = match.homeTeam?.members.length
        ? 'HOME'
        : match.awayTeam?.members.length
          ? 'AWAY'
          : match.creatorId === request.auth!.userId && (participantSide === 'HOME' || participantSide === 'AWAY')
            ? participantSide
            : null;
      if (!side) throw forbidden('Sólo un capitán o administrador de cada lado puede confirmar el resultado.');

      const ownPendingStatus = side === 'HOME' ? 'HOME_CONFIRMED' : 'AWAY_CONFIRMED';
      const otherSide = side === 'HOME' ? 'AWAY' : 'HOME';
      await tx.matchResultSubmission.upsert({
        where: { matchId_side: { matchId: id, side } },
        create: { matchId: id, submittedById: request.auth!.userId, side, homeScore: input.homeScore, awayScore: input.awayScore },
        update: { submittedById: request.auth!.userId, homeScore: input.homeScore, awayScore: input.awayScore },
      });
      const otherSubmission = await tx.matchResultSubmission.findUnique({ where: { matchId_side: { matchId: id, side: otherSide } } });
      const agreesWithOtherSide = otherSubmission?.homeScore === input.homeScore && otherSubmission.awayScore === input.awayScore;
      const updated = await tx.match.update({
        where: { id },
        data: otherSubmission
          ? { ...(agreesWithOtherSide ? { homeScore: input.homeScore, awayScore: input.awayScore } : {}), resultStatus: agreesWithOtherSide ? 'CONFIRMED' : 'DISPUTED', status: agreesWithOtherSide ? 'COMPLETED' : 'DISPUTED' }
          : { homeScore: input.homeScore, awayScore: input.awayScore, resultStatus: ownPendingStatus, status: 'COMPLETED' },
      });
      if (updated.resultStatus === 'CONFIRMED') {
        await applyVerifiedMatchRewards(tx, { matchId: id, homeScore: input.homeScore, awayScore: input.awayScore, participants: match.participants });
      }
      const response = JSON.parse(JSON.stringify(updated)) as Prisma.InputJsonObject;
      await tx.idempotencyRecord.create({ data: { userId: request.auth!.userId, key: input.idempotencyKey, operation, requestHash, responseCode: 200, responseBody: response, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return response;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.result.submit', outcome: 'success', targetType: 'match', targetId: id, requestId: request.id, ip: request.ip, metadata: { homeScore: input.homeScore, awayScore: input.awayScore } });
    return result;
  });
  app.post('/api/v1/matches/:id/no-shows/:userId', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id, userId } = NoShowParams.parse(request.params);
    if (userId === request.auth.userId) throw forbidden('No podés registrar tu propia ausencia.');
    const input = RecordNoShowSchema.parse(request.body);
    const match = await prisma.match.findUnique({ where: { id }, include: { participants: { where: { userId }, select: { id: true, checkedInAt: true, status: true } } } });
    if (!match) throw notFound('Partido');
    if (!(await canManageMatch(match, request.auth.userId))) throw forbidden('Sólo la organización puede confirmar una ausencia.');
    if (match.status !== 'COMPLETED' || (match.endsAt ?? new Date(match.startsAt.getTime() + 60 * 60 * 1000)) > new Date()) throw conflict('Las ausencias sólo se registran después de finalizar el partido.');
    const participant = match.participants[0];
    if (!participant || participant.checkedInAt || !['CONFIRMED', 'NO_SHOW'].includes(participant.status)) throw conflict('El jugador no cumple las condiciones para registrar una ausencia.');
    const outcome = await prisma.$transaction(async (tx) => {
      const previous = await tx.noShowEvent.findUnique({ where: { matchId_userId: { matchId: id, userId } } });
      if (previous) throw conflict('La ausencia ya fue registrada.');
      const noShow = await tx.noShowEvent.create({ data: { matchId: id, userId, reason: input.reason, confirmedBy: request.auth!.userId } });
      await tx.matchParticipant.update({ where: { id: participant.id }, data: { status: 'NO_SHOW' } });
      const profile = await tx.playerProfile.findUnique({ where: { userId }, select: { reliabilityScore: true } });
      if (profile) await tx.playerProfile.update({ where: { userId }, data: { reliabilityScore: Math.max(0, profile.reliabilityScore - 15) } });
      const recentCount = await tx.noShowEvent.count({ where: { userId, createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } });
      const suspensionHours = recentCount >= 4 ? 168 : recentCount === 3 ? 72 : recentCount === 2 ? 24 : 0;
      let suspensionId: string | null = null;
      if (suspensionHours > 0) {
        const endsAt = new Date(Date.now() + suspensionHours * 60 * 60 * 1000);
        const existing = await tx.suspension.findFirst({ where: { userId, status: { in: ['ACTIVE', 'APPEALED'] } }, orderBy: { endsAt: 'desc' } });
        const suspension = existing
          ? await tx.suspension.update({ where: { id: existing.id }, data: { status: 'ACTIVE', reason: `Ausencias reiteradas: ${recentCount} en 90 días.`, endsAt: existing.endsAt && existing.endsAt > endsAt ? existing.endsAt : endsAt } })
          : await tx.suspension.create({ data: { userId, reason: `Ausencias reiteradas: ${recentCount} en 90 días.`, endsAt } });
        suspensionId = suspension.id;
        await tx.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
      }
      await tx.notification.create({ data: { userId, category: 'SYSTEM', title: 'Ausencia registrada', body: suspensionHours > 0 ? `Tu cuenta quedó suspendida por ${suspensionHours} horas. Podés apelar desde Seguridad.` : 'Tu confiabilidad bajó. Si hubo un error, contactá a soporte.', data: { matchId: id, noShowId: noShow.id, suspensionId } } });
      return { noShowId: noShow.id, recentCount, suspensionHours, suspensionId };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.no_show.record', outcome: 'success', targetType: 'user', targetId: userId, requestId: request.id, ip: request.ip, metadata: { matchId: id, ...outcome } });
    return reply.code(201).send(outcome);
  });
}
