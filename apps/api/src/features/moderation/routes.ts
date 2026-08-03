import { ModerationDecisionSchema, ResolveMatchDisputeSchema, ResolveReportSchema, ResolveSuspensionSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireRoles } from '../../core/security/session.js';
import { applyVerifiedMatchRewards } from '../matches/routes.js';

const QueueQuery = z.object({ kind: z.enum(['reviews', 'posts', 'messages', 'reports', 'suspensions', 'disputes']) });
const DecisionParams = z.object({ kind: z.enum(['reviews', 'posts', 'messages']), id: z.string().min(1) });

export async function moderationRoutes(app: FastifyInstance) {
  app.get('/api/v1/admin/moderation/queue', { preHandler: requireRoles('MODERATOR', 'ADMIN') }, async (request) => {
    const { kind } = QueueQuery.parse(request.query);
    if (kind === 'reviews') return { items: await prisma.playerReview.findMany({ where: { moderationStatus: 'PENDING' }, include: { reviewer: { select: { id: true, displayName: true } }, reviewed: { select: { id: true, displayName: true } }, match: { select: { id: true, title: true } } }, orderBy: { createdAt: 'asc' }, take: 50 }) };
    if (kind === 'posts') return { items: await prisma.feedPost.findMany({ where: { moderationStatus: 'PENDING', deletedAt: null }, include: { author: { select: { id: true, displayName: true } } }, orderBy: { createdAt: 'asc' }, take: 50 }) };
    if (kind === 'messages') return { items: await prisma.message.findMany({ where: { moderationStatus: 'PENDING', deletedAt: null }, include: { sender: { select: { id: true, displayName: true } }, conversation: { select: { id: true, title: true, kind: true } } }, orderBy: { createdAt: 'asc' }, take: 50 }) };
    if (kind === 'reports') return { items: await prisma.report.findMany({ where: { status: { in: ['OPEN', 'TRIAGED'] } }, include: { reporter: { select: { id: true, displayName: true } }, reportedUser: { select: { id: true, displayName: true } } }, orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }], take: 50 }) };
    if (kind === 'disputes') return { items: await prisma.match.findMany({ where: { status: 'DISPUTED', resultStatus: 'DISPUTED' }, select: { id: true, title: true, startsAt: true, locality: true, homeScore: true, awayScore: true, homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } }, resultSubmissions: { select: { side: true, homeScore: true, awayScore: true, submittedById: true, createdAt: true } } }, orderBy: { updatedAt: 'asc' }, take: 50 }) };
    return { items: await prisma.suspension.findMany({ where: { status: 'APPEALED' }, include: { user: { select: { id: true, displayName: true }, } }, orderBy: { appealedAt: 'asc' }, take: 50 }) };
  });

  app.patch('/api/v1/admin/matches/:id/dispute', { preHandler: [requireRoles('MODERATOR', 'ADMIN'), mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const input = ResolveMatchDisputeSchema.parse(request.body);
    const match = await prisma.$transaction(async (tx) => {
      const disputed = await tx.match.findFirst({ where: { id, status: 'DISPUTED', resultStatus: 'DISPUTED' }, include: { participants: { select: { userId: true, side: true, checkedInAt: true } } } });
      if (!disputed) throw notFound('Disputa pendiente');
      const updated = await tx.match.update({ where: { id }, data: { homeScore: input.homeScore, awayScore: input.awayScore, status: 'COMPLETED', resultStatus: 'CONFIRMED' } });
      await applyVerifiedMatchRewards(tx, { matchId: id, homeScore: input.homeScore, awayScore: input.awayScore, participants: disputed.participants });
      await tx.notification.createMany({ data: [...new Set(disputed.participants.map((participant) => participant.userId))].map((userId) => ({ userId, category: 'MATCH' as const, title: 'Disputa resuelta', body: `${updated.title}: ${input.homeScore}–${input.awayScore}.`, data: { matchId: id } })) });
      return updated;
    }, { isolationLevel: 'Serializable' });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'match.dispute.resolve', outcome: 'success', targetType: 'match', targetId: id, requestId: request.id, ip: request.ip, metadata: { homeScore: input.homeScore, awayScore: input.awayScore, reason: input.reason } });
    return { id: match.id, status: match.status, resultStatus: match.resultStatus, homeScore: match.homeScore, awayScore: match.awayScore };
  });

  app.patch('/api/v1/admin/moderation/:kind/:id', { preHandler: [requireRoles('MODERATOR', 'ADMIN'), mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { kind, id } = DecisionParams.parse(request.params);
    const input = ModerationDecisionSchema.parse(request.body);
    let updated = 0;
    let reviewedUserId: string | null = null;
    if (kind === 'reviews') {
      const review = await prisma.playerReview.findUnique({ where: { id }, select: { reviewedId: true } });
      if (!review) throw notFound('Reseña');
      reviewedUserId = review.reviewedId;
      updated = (await prisma.playerReview.updateMany({ where: { id, moderationStatus: 'PENDING' }, data: { moderationStatus: input.decision } })).count;
    } else if (kind === 'posts') {
      updated = (await prisma.feedPost.updateMany({ where: { id, moderationStatus: 'PENDING' }, data: { moderationStatus: input.decision } })).count;
    } else {
      updated = (await prisma.message.updateMany({ where: { id, moderationStatus: 'PENDING' }, data: { moderationStatus: input.decision } })).count;
    }
    if (updated !== 1) throw notFound('Contenido pendiente');
    if (reviewedUserId) {
      const stats = await prisma.playerReview.aggregate({ where: { reviewedId: reviewedUserId, verifiedAttendance: true, moderationStatus: 'APPROVED', visibleAt: { lte: new Date() } }, _avg: { rating: true }, _count: { rating: true } });
      await prisma.playerProfile.updateMany({ where: { userId: reviewedUserId }, data: { ratingAverage: stats._avg.rating ?? 0, ratingCount: stats._count.rating } });
    }
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'moderation.decision', outcome: 'success', targetType: kind, targetId: id, requestId: request.id, ip: request.ip, metadata: { decision: input.decision, reason: input.reason } });
    return { id, status: input.decision };
  });

  app.patch('/api/v1/admin/reports/:id', { preHandler: [requireRoles('MODERATOR', 'ADMIN'), mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const input = ResolveReportSchema.parse(request.body);
    const result = await prisma.report.updateMany({ where: { id, status: { in: ['OPEN', 'TRIAGED', 'APPEALED'] } }, data: { status: input.status, resolvedAt: new Date(), evidence: { resolution: input.resolution } } });
    if (result.count !== 1) throw notFound('Reporte pendiente');
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'report.resolve', outcome: 'success', targetType: 'report', targetId: id, requestId: request.id, ip: request.ip, metadata: input });
    return { id, status: input.status };
  });

  app.patch('/api/v1/admin/suspensions/:id', { preHandler: [requireRoles('MODERATOR', 'ADMIN'), mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const input = ResolveSuspensionSchema.parse(request.body);
    const suspension = await prisma.suspension.findFirst({ where: { id, status: 'APPEALED' } });
    if (!suspension) throw notFound('Apelación');
    if (input.decision === 'LIFTED') {
      await prisma.$transaction(async (tx) => {
        await tx.suspension.update({ where: { id }, data: { status: 'LIFTED', liftedAt: new Date(), reason: `${suspension.reason} Resolución: ${input.reason}`.slice(0, 500) } });
        const other = await tx.suspension.count({ where: { userId: suspension.userId, id: { not: id }, status: { in: ['ACTIVE', 'APPEALED'] }, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } });
        if (other === 0) await tx.user.update({ where: { id: suspension.userId }, data: { status: 'ACTIVE' } });
      });
    } else {
      await prisma.suspension.update({ where: { id }, data: { status: 'ACTIVE', appealReason: `${suspension.appealReason ?? ''}\nResolución: ${input.reason}`.trim().slice(0, 1_000) } });
    }
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'suspension.resolve', outcome: 'success', targetType: 'suspension', targetId: id, requestId: request.id, ip: request.ip, metadata: input });
    return { id, status: input.decision === 'LIFTED' ? 'LIFTED' : 'ACTIVE' };
  });
}
