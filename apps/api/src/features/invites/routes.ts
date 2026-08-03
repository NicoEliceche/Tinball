import { Prisma } from '@prisma/client';
import { InvitePlayerSchema, RespondPlayerInviteSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const Params = z.object({ id: z.string().min(1) });

export async function inviteRoutes(app: FastifyInstance) {
  app.get('/api/v1/invites', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const items = await prisma.playerInvite.findMany({ where: { recipientId: request.auth.userId, status: 'PENDING', expiresAt: { gt: new Date() } }, include: { sender: { select: { id: true, displayName: true, avatarUrl: true, profile: { select: { primaryPosition: true, ratingAverage: true, reliabilityScore: true } } } }, lobby: { select: { id: true, title: true, startsAt: true, locality: true, format: true } }, team: { select: { id: true, name: true, crestUrl: true, crestColor: true, format: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
    return { items };
  });

  app.post('/api/v1/players/:id/invite', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id: recipientId } = Params.parse(request.params);
    const input = InvitePlayerSchema.parse(request.body);
    if (recipientId === request.auth.userId) throw conflict('No podés invitarte a vos mismo.');
    const recipient = await prisma.user.findFirst({ where: { id: recipientId, status: 'ACTIVE', onboardingComplete: true }, select: { id: true } });
    if (!recipient) throw notFound('Jugador');
    const blocked = await prisma.userBlock.findFirst({ where: { OR: [{ blockerId: request.auth.userId, blockedId: recipientId }, { blockerId: recipientId, blockedId: request.auth.userId }] }, select: { id: true } });
    if (blocked) throw forbidden('No se puede enviar esta invitación.');
    let lobbyId: string | undefined;
    let teamId: string | undefined;
    let contextKey = 'CONNECT';
    if (input.contextType === 'LOBBY') {
      const lobby = await prisma.lobby.findFirst({ where: { id: input.contextId, organizerId: request.auth.userId, status: { in: ['OPEN', 'FULL'] }, startsAt: { gt: new Date() } }, select: { id: true } });
      if (!lobby) throw forbidden('Sólo quien organiza un lobby activo puede invitar jugadores.');
      lobbyId = lobby.id; contextKey = `LOBBY:${lobby.id}`;
    } else if (input.contextType === 'TEAM') {
      const membership = await prisma.teamMember.findFirst({ where: { teamId: input.contextId, userId: request.auth.userId, status: 'ACTIVE', role: { in: ['CAPTAIN', 'ADMIN'] } }, select: { teamId: true } });
      if (!membership) throw forbidden('Sólo el capitán o un administrador puede invitar al equipo.');
      teamId = membership.teamId; contextKey = `TEAM:${membership.teamId}`;
    }
    const previous = await prisma.playerInvite.findUnique({ where: { senderId_recipientId_contextKey: { senderId: request.auth.userId, recipientId, contextKey } } });
    if (previous?.status === 'PENDING' && previous.expiresAt > new Date()) return previous;
    if (previous?.status === 'DECLINED' && previous.respondedAt && previous.respondedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) throw conflict('El jugador rechazó esta invitación recientemente.');
    const invite = await prisma.playerInvite.upsert({ where: { senderId_recipientId_contextKey: { senderId: request.auth.userId, recipientId, contextKey } }, create: { senderId: request.auth.userId, recipientId, lobbyId, teamId, contextKey, note: input.note, expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) }, update: { status: 'PENDING', note: input.note, expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), respondedAt: null } });
    await prisma.notification.create({ data: { userId: recipientId, category: 'INVITE', title: 'Nueva invitación', body: input.contextType === 'CONNECT' ? 'Un jugador quiere conectar con vos.' : input.contextType === 'LOBBY' ? 'Te invitaron a completar un partido.' : 'Te invitaron a formar parte de un equipo.', data: { inviteId: invite.id } } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'player.invite.create', outcome: 'success', targetType: 'playerInvite', targetId: invite.id, requestId: request.id, ip: request.ip, metadata: { contextType: input.contextType } });
    return reply.code(201).send(invite);
  });

  app.post('/api/v1/invites/:id/respond', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = Params.parse(request.params);
    const input = RespondPlayerInviteSchema.parse(request.body);
    const result = await prisma.$transaction(async (tx) => {
      const invite = await tx.playerInvite.findFirst({ where: { id, recipientId: request.auth!.userId } });
      if (!invite) throw notFound('Invitación');
      if (invite.status !== 'PENDING') throw conflict('La invitación ya fue respondida.');
      if (invite.expiresAt <= new Date()) { await tx.playerInvite.update({ where: { id }, data: { status: 'EXPIRED' } }); throw conflict('La invitación venció.'); }
      if (input.decision === 'ACCEPTED' && invite.lobbyId) {
        const lobby = await tx.lobby.findUnique({ where: { id: invite.lobbyId }, include: { _count: { select: { participants: { where: { status: { in: ['REQUESTED', 'CONFIRMED'] } } } } } } });
        if (!lobby || !['OPEN', 'FULL'].includes(lobby.status) || lobby.startsAt <= new Date()) throw conflict('El lobby ya no está disponible.');
        if (lobby._count.participants >= lobby.requiredPlayers) throw conflict('El lobby ya está completo.');
        if (lobby.premiumOnly) {
          const premium = await tx.subscription.findFirst({ where: { userId: request.auth!.userId, status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } });
          if (!premium) throw forbidden('Este lobby requiere Premium.');
        }
        const profile = await tx.playerProfile.findUnique({ where: { userId: request.auth!.userId }, select: { primaryPosition: true } });
        await tx.lobbyParticipant.upsert({ where: { lobbyId_userId: { lobbyId: lobby.id, userId: request.auth!.userId } }, create: { lobbyId: lobby.id, userId: request.auth!.userId, status: 'CONFIRMED', position: profile?.primaryPosition, joinedAt: new Date() }, update: { status: 'CONFIRMED', joinedAt: new Date() } });
        const conversation = await tx.conversation.upsert({ where: { kind_scopeRefId: { kind: 'LOBBY', scopeRefId: lobby.id } }, create: { kind: 'LOBBY', scopeRefId: lobby.id, title: lobby.title }, update: {} });
        await tx.conversationMember.upsert({ where: { conversationId_userId: { conversationId: conversation.id, userId: request.auth!.userId } }, create: { conversationId: conversation.id, userId: request.auth!.userId }, update: { leftAt: null } });
      }
      if (input.decision === 'ACCEPTED' && invite.teamId) {
        await tx.teamMember.upsert({ where: { teamId_userId: { teamId: invite.teamId, userId: request.auth!.userId } }, create: { teamId: invite.teamId, userId: request.auth!.userId, role: 'PLAYER', status: 'ACTIVE', joinedAt: new Date() }, update: { status: 'ACTIVE', joinedAt: new Date() } });
        const team = await tx.team.findUniqueOrThrow({ where: { id: invite.teamId }, select: { name: true } });
        const conversation = await tx.conversation.upsert({ where: { kind_scopeRefId: { kind: 'TEAM', scopeRefId: invite.teamId } }, create: { kind: 'TEAM', scopeRefId: invite.teamId, title: team.name }, update: {} });
        await tx.conversationMember.upsert({ where: { conversationId_userId: { conversationId: conversation.id, userId: request.auth!.userId } }, create: { conversationId: conversation.id, userId: request.auth!.userId }, update: { leftAt: null } });
      }
      return tx.playerInvite.update({ where: { id }, data: { status: input.decision, respondedAt: new Date() } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'player.invite.respond', outcome: 'success', targetType: 'playerInvite', targetId: id, requestId: request.id, ip: request.ip, metadata: { decision: input.decision } });
    return result;
  });
}
