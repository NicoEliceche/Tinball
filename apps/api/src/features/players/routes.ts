import { BlockUserSchema, CursorPaginationSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const PlayerParams = z.object({ id: z.string().min(1) });

function publicAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  if (now.getUTCMonth() < birthDate.getUTCMonth() || (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate())) age -= 1;
  return age;
}

export async function playerRoutes(app: FastifyInstance) {
  app.get('/api/v1/blocks', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const items = await prisma.userBlock.findMany({ where: { blockerId: request.auth.userId }, include: { blocked: { select: { id: true, displayName: true, avatarUrl: true, profile: { select: { locality: true, primaryPosition: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return { items: items.map((block) => ({ id: block.id, createdAt: block.createdAt, user: block.blocked })) };
  });

  app.get('/api/v1/players/discover', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const own = await prisma.playerProfile.findUnique({ where: { userId: request.auth.userId } });
    const profiles = await prisma.playerProfile.findMany({ where: { userId: { not: request.auth.userId }, user: { status: 'ACTIVE', settings: { allowDiscovery: true }, blockedBy: { none: { blockerId: request.auth.userId } }, blocksInitiated: { none: { blockedId: request.auth.userId } } }, ...(own ? { locality: own.locality } : {}) }, include: { user: { select: { id: true, displayName: true, avatarUrl: true, subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, take: 1, select: { id: true } }, _count: { select: { matchParticipations: true } } } } }, orderBy: [{ reliabilityScore: 'desc' }, { ratingAverage: 'desc' }], take: 30 });
    return { items: profiles.map((profile) => ({ id: profile.user.id, displayName: profile.user.displayName, age: publicAge(profile.birthDate), avatarUrl: profile.user.avatarUrl, locality: profile.locality, distanceKm: null, primaryPosition: profile.primaryPosition, secondaryPositions: profile.secondaryPositions, skillLevel: profile.skillLevel, preferredFoot: profile.preferredFoot, bio: profile.bio, rating: Number(profile.ratingAverage), reviewCount: profile.ratingCount, reliability: profile.reliabilityScore, rankPoints: null, matchesPlayed: profile.user._count.matchParticipations, winRate: null, tags: [], isPremium: profile.user.subscriptions.length > 0, isVerified: Boolean(profile.verifiedAt) })) };
  });

  app.get('/api/v1/players/:id', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const { id } = PlayerParams.parse(request.params);
    const user = await prisma.user.findFirst({
      where: { id, status: 'ACTIVE', onboardingComplete: true },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        _count: { select: { matchParticipations: true } },
        profile: true,
        subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true }, take: 1 },
        blockedBy: { where: { blockerId: request.auth.userId }, select: { id: true }, take: 1 },
        blocksInitiated: { where: { blockedId: request.auth.userId }, select: { id: true }, take: 1 },
        teamMemberships: { where: { status: 'ACTIVE' }, select: { role: true, team: { select: { id: true, name: true, crestUrl: true, crestColor: true, format: true, rankPoints: true, isVerified: true } } } },
      },
    });
    if (!user?.profile) throw notFound('Jugador');
    if (user.blocksInitiated.length > 0) throw notFound('Jugador');
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      age: publicAge(user.profile.birthDate),
      locality: user.profile.locality,
      distanceKm: null,
      primaryPosition: user.profile.primaryPosition,
      secondaryPositions: user.profile.secondaryPositions,
      skillLevel: user.profile.skillLevel,
      preferredFoot: user.profile.preferredFoot,
      bio: user.profile.bio,
      rating: Number(user.profile.ratingAverage),
      reviewCount: user.profile.ratingCount,
      reliability: user.profile.reliabilityScore,
      rankPoints: null,
      matchesPlayed: user._count.matchParticipations,
      winRate: null,
      tags: [],
      isPremium: user.subscriptions.length > 0,
      isVerified: Boolean(user.profile.verifiedAt),
      isBlocked: user.blockedBy.length > 0,
      teams: user.teamMemberships,
    };
  });

  app.post('/api/v1/players/:id/block', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id: blockedId } = PlayerParams.parse(request.params);
    const input = BlockUserSchema.parse(request.body ?? {});
    if (blockedId === request.auth.userId) throw conflict('No podés bloquear tu propia cuenta.');
    const subject = await prisma.user.findFirst({ where: { id: blockedId, status: 'ACTIVE' }, select: { id: true } });
    if (!subject) throw notFound('Jugador');
    const block = await prisma.$transaction(async (tx) => {
      const created = await tx.userBlock.upsert({ where: { blockerId_blockedId: { blockerId: request.auth!.userId, blockedId } }, create: { blockerId: request.auth!.userId, blockedId, reason: input.reason }, update: { reason: input.reason } });
      await tx.playerInvite.updateMany({ where: { OR: [{ senderId: request.auth!.userId, recipientId: blockedId }, { senderId: blockedId, recipientId: request.auth!.userId }], status: 'PENDING' }, data: { status: 'CANCELLED', respondedAt: new Date() } });
      return created;
    });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'user.block', outcome: 'success', targetType: 'user', targetId: blockedId, requestId: request.id, ip: request.ip });
    return reply.code(201).send(block);
  });

  app.delete('/api/v1/players/:id/block', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id: blockedId } = PlayerParams.parse(request.params);
    await prisma.userBlock.deleteMany({ where: { blockerId: request.auth.userId, blockedId } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'user.unblock', outcome: 'success', targetType: 'user', targetId: blockedId, requestId: request.id, ip: request.ip });
    return reply.code(204).send();
  });

  app.get('/api/v1/players/:id/reviews', { preHandler: requireOnboarded }, async (request) => {
    const { id } = PlayerParams.parse(request.params);
    const query = CursorPaginationSchema.parse(request.query);
    const items = await prisma.playerReview.findMany({
      where: { reviewedId: id, verifiedAttendance: true, moderationStatus: 'APPROVED', visibleAt: { lte: new Date() } },
      include: { reviewer: { select: { id: true, displayName: true, avatarUrl: true } }, match: { select: { id: true, title: true, startsAt: true } } },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    return { items, nextCursor: items.length === query.limit ? items.at(-1)?.id : undefined };
  });
}
