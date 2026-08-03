import { Prisma } from '@prisma/client';
import { CreateLobbySchema, CursorPaginationSchema, JoinLobbySchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { sha256 } from '../../core/security/crypto.js';
import { featureFlags } from '../../core/security/featureFlags.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const LobbyQuerySchema = CursorPaginationSchema.extend({ locality: z.string().trim().max(80).optional(), mode: z.enum(['NEED_ONE', 'OPEN', 'PREMADE', 'PRIZE']).optional() });

export async function lobbyRoutes(app: FastifyInstance) {
  app.get('/api/v1/lobbies', { preHandler: requireOnboarded }, async (request) => {
    const query = LobbyQuerySchema.parse(request.query);
    const items = await prisma.lobby.findMany({
      where: {
        status: { in: ['OPEN', 'FULL', 'CONFIRMED'] },
        startsAt: { gt: new Date() },
        ...(query.locality
          ? { locality: { equals: query.locality, mode: 'insensitive' as const } }
          : {}),
        ...(query.mode ? { mode: query.mode } : {}),
      },
      include: {
        organizer: { select: { displayName: true, avatarUrl: true, profile: { select: { reliabilityScore: true } } } },
        venue: { select: { name: true } },
        participants: { where: { userId: request.auth!.userId }, select: { status: true } },
        _count: {
          select: {
            participants: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
      orderBy: [{ premiumOnly: 'desc' }, { startsAt: 'asc' }],
      take: query.limit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    const conversations = await prisma.conversation.findMany({ where: { kind: 'LOBBY', scopeRefId: { in: items.map((item) => item.id) }, members: { some: { userId: request.auth!.userId, leftAt: null } } }, select: { id: true, scopeRefId: true } });
    const conversationByLobby = new Map(conversations.map((conversation) => [conversation.scopeRefId, conversation.id]));

    return {
      items: items.map((lobby) => ({
        id: lobby.id,
        organizerId: lobby.organizerId,
        title: lobby.title,
        organizerName: lobby.organizer.displayName,
        organizerAvatar: lobby.organizer.avatarUrl,
        mode: lobby.mode,
        format: lobby.format,
        locality: lobby.locality,
        venueName: lobby.venue?.name ?? 'A confirmar',
        startsAt: lobby.startsAt.toISOString(),
        durationMinutes: lobby.durationMinutes,
        joinedPlayers: lobby._count.participants,
        requiredPlayers: lobby.requiredPlayers,
        positionsNeeded: lobby.positionsNeeded,
        skillMin: lobby.skillMin,
        skillMax: lobby.skillMax,
        pricePerPlayerMinor: lobby.pricePerPlayerMinor,
        currency: lobby.currency,
        premiumOnly: lobby.premiumOnly,
        status: lobby.status,
        notes: lobby.notes,
        commitmentScore: lobby.organizer.profile?.reliabilityScore ?? 100,
        myParticipationStatus: lobby.participants[0]?.status ?? null,
        conversationId: conversationByLobby.get(lobby.id) ?? null,
      })),
      nextCursor: items.length === query.limit ? items.at(-1)?.id : undefined,
    };
  });

  app.post('/api/v1/lobbies', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = CreateLobbySchema.parse(request.body);
    if (input.mode === 'PRIZE' && !featureFlags.prizeLobbies) throw forbidden('Los desafíos con premio todavía no están habilitados.');
    const startsAt = new Date(input.startsAt);
    if (startsAt.getTime() < Date.now() + 30 * 60 * 1000) throw conflict('El lobby debe comenzar al menos 30 minutos en el futuro.');
    const profile = await prisma.playerProfile.findUnique({ where: { userId: request.auth.userId } });
    if (!profile) throw conflict('Completá tu perfil antes de organizar un partido.');
    if (input.premiumOnly) {
      const subscription = await prisma.subscription.findFirst({ where: { userId: request.auth.userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } });
      if (!subscription) throw forbidden('Necesitás Premium activo para organizar un lobby Premium.');
    }
    const lobby = await prisma.lobby.create({ data: { organizerId: request.auth.userId, title: input.title, mode: input.mode, status: 'OPEN', format: input.format, locality: input.locality, venueId: input.venueId, startsAt, durationMinutes: input.durationMinutes, requiredPlayers: input.requiredPlayers, skillMin: input.skillMin, skillMax: input.skillMax, positionsNeeded: input.positionsNeeded, pricePerPlayerMinor: input.pricePerPlayerMinor, currency: input.currency.toUpperCase(), premiumOnly: input.premiumOnly, notes: input.notes, participants: { create: { userId: request.auth.userId, position: profile.primaryPosition, status: 'CONFIRMED', joinedAt: new Date() } } } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'lobby.create', outcome: 'success', targetType: 'lobby', targetId: lobby.id, requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'] });
    return reply.code(201).send(lobby);
  });

  app.get('/api/v1/lobbies/:id/requests', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const lobby = await prisma.lobby.findUnique({ where: { id }, select: { organizerId: true } });
    if (!lobby) throw notFound('Lobby');
    if (lobby.organizerId !== request.auth.userId) throw forbidden('Sólo quien organiza el lobby puede ver las solicitudes.');
    const items = await prisma.lobbyParticipant.findMany({ where: { lobbyId: id, status: 'REQUESTED' }, include: { user: { select: { id: true, displayName: true, avatarUrl: true, profile: { select: { primaryPosition: true, ratingAverage: true, reliabilityScore: true } } } } }, orderBy: { createdAt: 'asc' }, take: 50 });
    return { items: items.map((participant) => ({ userId: participant.userId, displayName: participant.user.displayName, avatarUrl: participant.user.avatarUrl, position: participant.position ?? participant.user.profile?.primaryPosition ?? null, rating: Number(participant.user.profile?.ratingAverage ?? 0), reliability: participant.user.profile?.reliabilityScore ?? 100, requestedAt: participant.createdAt })) };
  });

  app.post('/api/v1/lobbies/:id/join', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const input = JoinLobbySchema.parse(request.body);
    const operation = 'lobby.join';
    const requestHash = sha256(JSON.stringify(input));
    const result = await prisma.$transaction(async (tx) => {
      const existingKey = await tx.idempotencyRecord.findUnique({ where: { userId_key_operation: { userId: request.auth!.userId, key: input.idempotencyKey, operation } } });
      if (existingKey) {
        if (existingKey.requestHash !== requestHash) throw conflict('La clave de idempotencia ya fue usada con otros datos.');
        if (existingKey.responseBody) return existingKey.responseBody;
        throw conflict('La solicitud original todavía está en proceso.');
      }
      const lobby = await tx.lobby.findUnique({ where: { id: params.id }, include: { _count: { select: { participants: { where: { status: 'CONFIRMED' } } } } } });
      if (!lobby) throw notFound('Lobby');
      if (!['OPEN', 'FULL'].includes(lobby.status) || lobby.startsAt <= new Date()) throw conflict('Este lobby ya no recibe jugadores.');
      if (lobby._count.participants >= lobby.requiredPlayers) throw conflict('El lobby ya está completo.');
      if (lobby.premiumOnly) {
        const active = await tx.subscription.findFirst({ where: { userId: request.auth!.userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } });
        if (!active) throw forbidden('Este lobby requiere Premium.');
      }
      if (input.teamId) {
        if (lobby.mode !== 'PREMADE') throw conflict('Un equipo sólo puede anotarse en un lobby con premades.');
        const team = await tx.team.findUnique({ where: { id: input.teamId }, select: { format: true, members: { where: { userId: request.auth!.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } }, select: { id: true } } } });
        if (!team?.members.length) throw forbidden('Sólo el capitán o un administrador puede representar a ese equipo.');
        if (team.format !== lobby.format) throw conflict('El formato del equipo no coincide con el lobby.');
      }
      const participant = await tx.lobbyParticipant.upsert({ where: { lobbyId_userId: { lobbyId: lobby.id, userId: request.auth!.userId } }, create: { lobbyId: lobby.id, userId: request.auth!.userId, teamId: input.teamId, position: input.position, status: 'REQUESTED' }, update: { teamId: input.teamId, position: input.position, status: 'REQUESTED' } });
      const response = { participantId: participant.id, status: participant.status };
      await tx.idempotencyRecord.create({ data: { userId: request.auth!.userId, key: input.idempotencyKey, operation, requestHash, responseCode: 200, responseBody: response, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return response;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'lobby.join', outcome: 'success', targetType: 'lobby', targetId: params.id, requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'] });
    return result;
  });

  app.post('/api/v1/lobbies/:id/requests/:userId/respond', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const params = z.object({ id: z.string().min(1), userId: z.string().min(1) }).parse(request.params);
    const input = z.object({ decision: z.enum(['ACCEPTED', 'DECLINED']) }).parse(request.body);
    const result = await prisma.$transaction(async (tx) => {
      const lobby = await tx.lobby.findUnique({ where: { id: params.id }, select: { id: true, title: true, organizerId: true, requiredPlayers: true, status: true, startsAt: true } });
      if (!lobby) throw notFound('Lobby');
      if (lobby.organizerId !== request.auth!.userId) throw forbidden('Sólo quien organiza el lobby puede responder solicitudes.');
      if (!['OPEN', 'FULL'].includes(lobby.status) || lobby.startsAt <= new Date()) throw conflict('El lobby ya no admite cambios de participantes.');
      const participant = await tx.lobbyParticipant.findUnique({ where: { lobbyId_userId: { lobbyId: lobby.id, userId: params.userId } } });
      if (!participant || participant.status !== 'REQUESTED') throw conflict('La solicitud ya no está pendiente.');
      if (input.decision === 'ACCEPTED') {
        const confirmed = await tx.lobbyParticipant.count({ where: { lobbyId: lobby.id, status: 'CONFIRMED' } });
        if (confirmed >= lobby.requiredPlayers) throw conflict('El lobby ya está completo.');
      }
      const status = input.decision === 'ACCEPTED' ? 'CONFIRMED' : 'DECLINED';
      const updated = await tx.lobbyParticipant.update({ where: { id: participant.id }, data: { status, joinedAt: status === 'CONFIRMED' ? new Date() : null } });
      if (status === 'CONFIRMED') {
        const conversation = await tx.conversation.upsert({ where: { kind_scopeRefId: { kind: 'LOBBY', scopeRefId: lobby.id } }, create: { kind: 'LOBBY', scopeRefId: lobby.id, title: lobby.title }, update: {} });
        await Promise.all([lobby.organizerId, params.userId].map((userId) => tx.conversationMember.upsert({ where: { conversationId_userId: { conversationId: conversation.id, userId } }, create: { conversationId: conversation.id, userId }, update: { leftAt: null } })));
        const confirmed = await tx.lobbyParticipant.count({ where: { lobbyId: lobby.id, status: 'CONFIRMED' } });
        if (confirmed >= lobby.requiredPlayers) await tx.lobby.update({ where: { id: lobby.id }, data: { status: 'FULL' } });
      }
      await tx.notification.create({ data: { userId: params.userId, category: 'INVITE', title: input.decision === 'ACCEPTED' ? '¡Estás dentro!' : 'Solicitud no aceptada', body: input.decision === 'ACCEPTED' ? `Tu lugar en ${lobby.title} fue confirmado.` : `La organización de ${lobby.title} eligió otra configuración de plantel.`, data: { lobbyId: lobby.id } } });
      return { participantId: updated.id, status: updated.status };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'lobby.request.respond', outcome: 'success', targetType: 'lobby', targetId: params.id, requestId: request.id, ip: request.ip, metadata: { participantUserId: params.userId, decision: input.decision } });
    return result;
  });

  app.post('/api/v1/lobbies/:id/confirm', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const match = await prisma.$transaction(async (tx) => {
      const lobby = await tx.lobby.findUnique({ where: { id }, include: { match: true, participants: { where: { status: 'CONFIRMED' }, orderBy: { joinedAt: 'asc' } } } });
      if (!lobby) throw notFound('Lobby');
      if (lobby.organizerId !== request.auth!.userId) throw forbidden('Sólo quien organiza el lobby puede confirmar el partido.');
      if (lobby.match) return lobby.match;
      if (lobby.status !== 'FULL' || lobby.participants.length < lobby.requiredPlayers) throw conflict('Completá y confirmá los cupos antes de crear el partido.');
      if (lobby.startsAt <= new Date()) throw conflict('El horario del lobby ya pasó.');
      const created = await tx.match.create({ data: { creatorId: request.auth!.userId, lobbyId: lobby.id, venueId: lobby.venueId, title: lobby.title, format: lobby.format, locality: lobby.locality, startsAt: lobby.startsAt, endsAt: new Date(lobby.startsAt.getTime() + lobby.durationMinutes * 60 * 1000), status: 'CONFIRMED', participants: { create: lobby.participants.map((participant, index) => ({ userId: participant.userId, side: index % 2 === 0 ? 'HOME' : 'AWAY', position: participant.position, status: 'CONFIRMED', confirmedAt: participant.joinedAt ?? new Date() })) } } });
      const conversation = await tx.conversation.create({ data: { kind: 'MATCH', scopeRefId: created.id, title: created.title, members: { create: lobby.participants.map((participant) => ({ userId: participant.userId })) } } });
      await tx.lobby.update({ where: { id: lobby.id }, data: { status: 'CONVERTED' } });
      await tx.notification.createMany({ data: lobby.participants.map((participant) => ({ userId: participant.userId, category: 'MATCH' as const, title: 'Partido confirmado', body: `${created.title} ya está en tu calendario.`, data: { matchId: created.id, conversationId: conversation.id } })) });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'lobby.confirm', outcome: 'success', targetType: 'match', targetId: match.id, requestId: request.id, ip: request.ip, metadata: { lobbyId: id } });
    return reply.code(201).send(match);
  });
}
