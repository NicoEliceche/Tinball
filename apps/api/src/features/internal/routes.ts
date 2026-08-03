import type { FastifyInstance } from 'fastify';
import { env } from '../../core/config/env.js';
import { prisma } from '../../core/data/prisma.js';
import { HttpError, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { safeEqual } from '../../core/security/crypto.js';

function requireWorker(request: { headers: { authorization?: string } }): void {
  if (!env.WORKER_SECRET) throw new HttpError(503, 'WORKER_DISABLED', 'Worker no configurado.');
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw unauthorized();
  const candidate = authorization.slice(7).trim();
  if (!safeEqual(candidate, env.WORKER_SECRET)) throw unauthorized();
}

export async function internalRoutes(app: FastifyInstance) {
  app.post('/internal/workers/run', async (request) => {
    requireWorker(request);
    const now = new Date();
    const staleRedemptionCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma.$transaction(async (tx) => {
      const expiringSuspensions = await tx.suspension.findMany({ where: { status: { in: ['ACTIVE', 'APPEALED'] }, endsAt: { lte: now } }, select: { userId: true } });
      const [sessions, idempotency, lobbies, invites, bookings, redemptions, subscriptions, referralCodes] = await Promise.all([
        tx.session.deleteMany({ where: { OR: [{ expiresAt: { lte: now } }, { revokedAt: { not: null }, lastUsedAt: { lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }] } }),
        tx.idempotencyRecord.deleteMany({ where: { expiresAt: { lte: now } } }),
        tx.lobby.updateMany({ where: { status: { in: ['OPEN', 'FULL'] }, startsAt: { lt: now } }, data: { status: 'CANCELLED', cancelledAt: now } }),
        tx.playerInvite.updateMany({ where: { status: 'PENDING', expiresAt: { lte: now } }, data: { status: 'EXPIRED' } }),
        tx.booking.updateMany({ where: { status: 'HOLD', holdExpiresAt: { lte: now } }, data: { status: 'CANCELLED' } }),
        tx.rewardRedemption.updateMany({ where: { status: 'PENDING', createdAt: { lt: staleRedemptionCutoff } }, data: { status: 'EXPIRED' } }),
        tx.subscription.updateMany({ where: { status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] }, currentPeriodEnd: { lte: now } }, data: { status: 'EXPIRED' } }),
        tx.referralCode.updateMany({ where: { active: true, expiresAt: { lte: now } }, data: { active: false } }),
      ]);
      const ratings = await tx.playerReview.groupBy({ by: ['reviewedId'], where: { verifiedAttendance: true, moderationStatus: 'APPROVED', visibleAt: { lte: now } }, _avg: { rating: true }, _count: { rating: true } });
      for (const rating of ratings) {
        await tx.playerProfile.updateMany({ where: { userId: rating.reviewedId }, data: { ratingAverage: rating._avg.rating ?? 0, ratingCount: rating._count.rating } });
      }
      const lifted = await tx.suspension.updateMany({ where: { status: { in: ['ACTIVE', 'APPEALED'] }, endsAt: { lte: now } }, data: { status: 'LIFTED', liftedAt: now } });
      for (const userId of new Set(expiringSuspensions.map((suspension) => suspension.userId))) {
        const remaining = await tx.suspension.count({ where: { userId, status: { in: ['ACTIVE', 'APPEALED'] }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } });
        if (remaining === 0) await tx.user.updateMany({ where: { id: userId, status: 'SUSPENDED' }, data: { status: 'ACTIVE' } });
      }
      return {
        deletedSessions: sessions.count,
        deletedIdempotencyRecords: idempotency.count,
        cancelledExpiredLobbies: lobbies.count,
        expiredPlayerInvites: invites.count,
        cancelledExpiredBookingHolds: bookings.count,
        expiredRedemptions: redemptions.count,
        expiredSubscriptions: subscriptions.count,
        disabledReferralCodes: referralCodes.count,
        refreshedPlayerRatings: ratings.length,
        liftedSuspensions: lifted.count,
      };
    });
    await writeAudit({ action: 'worker.maintenance', outcome: 'success', requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'], metadata: result });
    return { ok: true, ...result, completedAt: now.toISOString() };
  });
}
