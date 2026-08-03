import { CommentOnPostSchema, CreatePostSchema, CursorPaginationSchema, ReactToPostSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../../core/config/env.js';
import { prisma } from '../../core/data/prisma.js';
import { forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

export async function socialRoutes(app: FastifyInstance) {
  app.get('/api/v1/feed', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized(); const query = CursorPaginationSchema.parse(request.query);
    const items = await prisma.feedPost.findMany({ where: { deletedAt: null, moderationStatus: { in: ['APPROVED', ...(env.NODE_ENV === 'production' ? [] : ['PENDING' as const])] }, author: { blockedBy: { none: { blockerId: request.auth.userId } }, blocksInitiated: { none: { blockedId: request.auth.userId } } } }, include: { author: { select: { id: true, displayName: true, avatarUrl: true } }, _count: { select: { reactions: true, comments: true } }, reactions: { where: { userId: request.auth.userId }, select: { kind: true } } }, orderBy: { createdAt: 'desc' }, take: query.limit, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}) });
    return { items, nextCursor: items.length === query.limit ? items.at(-1)?.id : undefined };
  });
  app.post('/api/v1/feed', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized(); const input = CreatePostSchema.parse(request.body);
    if (input.kind === 'RESULT') { if (!input.matchId) throw forbidden('Un resultado debe estar vinculado a un partido.'); const match = await prisma.match.findFirst({ where: { id: input.matchId, status: 'COMPLETED', resultStatus: 'CONFIRMED', participants: { some: { userId: request.auth.userId } } } }); if (!match) throw forbidden('Sólo podés publicar resultados verificados en los que participaste.'); }
    if (input.teamId) { const membership = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: input.teamId, userId: request.auth.userId } }, select: { status: true } }); if (membership?.status !== 'ACTIVE') throw forbidden('No podés publicar en nombre de ese equipo.'); }
    const post = await prisma.feedPost.create({ data: { authorId: request.auth.userId, kind: input.kind, body: input.body, matchId: input.matchId, teamId: input.teamId, moderationStatus: env.NODE_ENV === 'production' ? 'PENDING' : 'APPROVED' } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'feed.post.create', outcome: 'success', targetType: 'feedPost', targetId: post.id, requestId: request.id, ip: request.ip });
    return reply.code(201).send(post);
  });

  app.post('/api/v1/feed/:id/reactions', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params); const input = ReactToPostSchema.parse(request.body);
    const post = await prisma.feedPost.findFirst({ where: { id, deletedAt: null, moderationStatus: 'APPROVED' }, select: { id: true } }); if (!post) throw notFound('Publicación');
    const reaction = await prisma.feedReaction.upsert({ where: { postId_userId: { postId: id, userId: request.auth.userId } }, create: { postId: id, userId: request.auth.userId, kind: input.kind }, update: { kind: input.kind } });
    return reply.code(201).send(reaction);
  });

  app.delete('/api/v1/feed/:id/reactions', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    await prisma.feedReaction.deleteMany({ where: { postId: id, userId: request.auth.userId } });
    return reply.code(204).send();
  });

  app.post('/api/v1/feed/:id/comments', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized();
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params); const input = CommentOnPostSchema.parse(request.body);
    const post = await prisma.feedPost.findFirst({ where: { id, deletedAt: null, moderationStatus: 'APPROVED' }, select: { id: true } }); if (!post) throw notFound('Publicación');
    const comment = await prisma.feedComment.create({ data: { postId: id, userId: request.auth.userId, text: input.text, moderationStatus: env.NODE_ENV === 'production' ? 'PENDING' : 'APPROVED' } });
    return reply.code(201).send(comment);
  });
}
