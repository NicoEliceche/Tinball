import { Prisma } from '@prisma/client';
import { SubmitReviewSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

export async function reviewRoutes(app: FastifyInstance) {
  app.post('/api/v1/reviews', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized(); const input = SubmitReviewSchema.parse(request.body);
    if (input.reviewedUserId === request.auth.userId) throw forbidden('No podés valorarte a vos mismo.');
    const match = await prisma.match.findUnique({ where: { id: input.matchId }, include: { participants: { where: { userId: { in: [request.auth.userId, input.reviewedUserId] } } } } });
    if (!match) throw notFound('Partido'); if (match.status !== 'COMPLETED' || match.resultStatus !== 'CONFIRMED') throw conflict('El partido todavía no tiene resultado confirmado.');
    const reviewer = match.participants.find((participant) => participant.userId === request.auth!.userId); const reviewed = match.participants.find((participant) => participant.userId === input.reviewedUserId);
    if (!reviewer?.checkedInAt || !reviewed?.checkedInAt) throw forbidden('Sólo participantes con asistencia verificada pueden valorarse.');
    const visibleAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const review = await prisma.$transaction(async (tx) => {
      const existing = await tx.playerReview.findUnique({ where: { matchId_reviewerId_reviewedId: { matchId: input.matchId, reviewerId: request.auth!.userId, reviewedId: input.reviewedUserId } } });
      if (existing) {
        if (existing.rating === input.rating && existing.comment === input.comment) return existing;
        throw conflict('Ya valoraste a este jugador en este partido.');
      }
      const created = await tx.playerReview.create({ data: { matchId: input.matchId, reviewerId: request.auth!.userId, reviewedId: input.reviewedUserId, rating: input.rating, tags: input.tags, comment: input.comment, verifiedAttendance: true, visibleAt, moderationStatus: 'PENDING' } });
      const reciprocal = await tx.playerReview.findUnique({ where: { matchId_reviewerId_reviewedId: { matchId: input.matchId, reviewerId: input.reviewedUserId, reviewedId: request.auth!.userId } } });
      if (reciprocal) await tx.playerReview.updateMany({ where: { matchId: input.matchId, OR: [{ reviewerId: request.auth!.userId, reviewedId: input.reviewedUserId }, { reviewerId: input.reviewedUserId, reviewedId: request.auth!.userId }] }, data: { visibleAt: new Date() } });
      const stats = await tx.playerReview.aggregate({ where: { reviewedId: input.reviewedUserId, verifiedAttendance: true, moderationStatus: 'APPROVED', visibleAt: { lte: new Date() } }, _avg: { rating: true }, _count: { rating: true } });
      await tx.playerProfile.update({ where: { userId: input.reviewedUserId }, data: { ratingAverage: new Prisma.Decimal(stats._avg.rating ?? 0), ratingCount: stats._count.rating } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'review.create', outcome: 'success', targetType: 'review', targetId: review.id, requestId: request.id, ip: request.ip, metadata: { matchId: input.matchId, reviewedUserId: input.reviewedUserId, rating: input.rating } });
    return reply.code(201).send(review);
  });
}
