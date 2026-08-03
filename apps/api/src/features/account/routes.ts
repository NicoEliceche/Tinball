import { Prisma } from '@prisma/client';
import { DeleteAccountSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../core/config/env.js';
import { prisma } from '../../core/data/prisma.js';
import { unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { authenticate, clearWebSessionCookie } from '../../core/security/session.js';

const google = new OAuth2Client();

export async function accountRoutes(app: FastifyInstance) {
  app.get('/api/v1/account/export', { preHandler: authenticate }, async (request, reply) => {
    if (!request.auth) throw unauthorized();
    const user = await prisma.user.findUnique({
      where: { id: request.auth.userId },
      select: {
        id: true, email: true, displayName: true, avatarUrl: true, role: true, status: true, onboardingComplete: true, createdAt: true, updatedAt: true,
        profile: true, settings: true,
        teamMemberships: { select: { teamId: true, role: true, status: true, joinedAt: true, createdAt: true } },
        lobbyParticipations: { select: { lobbyId: true, position: true, status: true, joinedAt: true, createdAt: true } },
        matchParticipations: { select: { matchId: true, side: true, position: true, status: true, confirmedAt: true, checkedInAt: true, createdAt: true } },
        reviewsWritten: { select: { id: true, matchId: true, rating: true, tags: true, comment: true, visibleAt: true, createdAt: true } },
        reviewsReceived: { select: { id: true, matchId: true, rating: true, tags: true, comment: true, visibleAt: true, createdAt: true } },
        rankingEntries: true, rankingEvents: true, pointsEntries: true,
        redemptions: { select: { id: true, rewardId: true, status: true, pointsSpent: true, createdAt: true, fulfilledAt: true } },
        feedPosts: { select: { id: true, kind: true, body: true, matchId: true, teamId: true, moderationStatus: true, createdAt: true, deletedAt: true } },
        messages: { select: { id: true, conversationId: true, kind: true, text: true, moderationStatus: true, createdAt: true, editedAt: true, deletedAt: true } },
        resultSubmissions: { select: { id: true, matchId: true, side: true, homeScore: true, awayScore: true, createdAt: true, updatedAt: true } },
        premiumInterest: { select: { platform: true, createdAt: true, updatedAt: true } },
        referralsMade: { select: { id: true, status: true, pointsAwarded: true, createdAt: true, qualifiedAt: true, rewardedAt: true } },
        suspensions: { select: { id: true, reason: true, status: true, startsAt: true, endsAt: true, appealReason: true, liftedAt: true } },
        reportsMade: { select: { id: true, category: true, targetType: true, targetId: true, detail: true, status: true, createdAt: true, resolvedAt: true } },
      },
    });
    if (!user) throw unauthorized();
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'account.export', outcome: 'success', targetType: 'user', targetId: request.auth.userId, requestId: request.id, ip: request.ip });
    reply.header('Content-Disposition', `attachment; filename="tinball-data-${request.auth.userId}.json"`);
    return { exportedAt: new Date().toISOString(), user };
  });

  app.delete('/api/v1/account', { preHandler: [authenticate, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = DeleteAccountSchema.parse(request.body);
    let subject: string | undefined;
    try {
      const ticket = await google.verifyIdToken({ idToken: input.idToken, audience: env.googleAudiences });
      const payload = ticket.getPayload();
      if (payload?.email_verified !== true) throw unauthorized();
      subject = payload.sub;
    } catch {
      throw unauthorized();
    }
    const identity = await prisma.oAuthIdentity.findUnique({ where: { provider_providerSub: { provider: 'google', providerSub: subject } }, select: { userId: true } });
    if (identity?.userId !== request.auth.userId) throw unauthorized();
    const now = new Date();
    const userId = request.auth.userId;
    await prisma.$transaction(async (tx) => {
      await tx.feedPost.updateMany({ where: { authorId: userId, deletedAt: null }, data: { deletedAt: now, body: '[contenido eliminado]' } });
      await tx.feedComment.updateMany({ where: { userId, deletedAt: null }, data: { deletedAt: now, text: '[contenido eliminado]' } });
      await tx.message.updateMany({ where: { senderId: userId, deletedAt: null }, data: { deletedAt: now, text: '[mensaje eliminado]' } });
      await tx.matchResultSubmission.updateMany({ where: { submittedById: userId }, data: { submittedById: null } });
      await tx.teamMember.updateMany({ where: { userId, status: { in: ['INVITED', 'ACTIVE'] } }, data: { status: 'LEFT' } });
      await tx.lobbyParticipant.updateMany({ where: { userId, status: { in: ['INVITED', 'REQUESTED', 'CONFIRMED', 'WAITLISTED'] } }, data: { status: 'CANCELLED' } });
      await tx.matchParticipant.updateMany({ where: { userId, status: { in: ['INVITED', 'REQUESTED', 'CONFIRMED', 'WAITLISTED'] } }, data: { status: 'CANCELLED' } });
      await tx.playerInvite.updateMany({ where: { OR: [{ senderId: userId }, { recipientId: userId }], status: 'PENDING' }, data: { status: 'CANCELLED', respondedAt: now } });
      await tx.lobby.updateMany({ where: { organizerId: userId, status: { in: ['DRAFT', 'OPEN', 'FULL', 'CONFIRMED'] }, startsAt: { gt: now } }, data: { status: 'CANCELLED', cancelledAt: now } });
      await tx.match.updateMany({ where: { creatorId: userId, status: { in: ['DRAFT', 'CALLING', 'CONFIRMED'] }, startsAt: { gt: now } }, data: { status: 'CANCELLED', cancelledAt: now } });
      await tx.rankingEntry.updateMany({ where: { userId }, data: { locality: 'Eliminado' } });
      await tx.pushDevice.deleteMany({ where: { userId } });
      await tx.premiumInterest.deleteMany({ where: { userId } });
      await tx.userBlock.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } });
      await tx.playerProfile.deleteMany({ where: { userId } });
      await tx.userSettings.deleteMany({ where: { userId } });
      await tx.oAuthIdentity.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.user.update({ where: { id: userId }, data: { email: `deleted+${userId}@invalid.tinball`, displayName: 'Cuenta eliminada', avatarUrl: null, status: 'DELETED', onboardingComplete: false, deletedAt: now } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: userId, sessionId: request.auth.sessionId, action: 'account.delete', outcome: 'success', targetType: 'user', targetId: userId, requestId: request.id, ip: request.ip });
    clearWebSessionCookie(reply);
    return reply.code(204).send();
  });
}
