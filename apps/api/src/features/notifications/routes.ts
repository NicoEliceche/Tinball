import { CursorPaginationSchema, MarkNotificationsReadSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { unauthorized } from '../../core/http/errors.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

export async function notificationRoutes(app: FastifyInstance) {
  app.get('/api/v1/notifications', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const query = CursorPaginationSchema.parse(request.query);
    const items = await prisma.notification.findMany({ where: { userId: request.auth.userId }, orderBy: { createdAt: 'desc' }, take: query.limit, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}) });
    return { items, nextCursor: items.length === query.limit ? items.at(-1)?.id : undefined };
  });

  app.post('/api/v1/notifications/read', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = MarkNotificationsReadSchema.parse(request.body);
    const result = await prisma.notification.updateMany({ where: { id: { in: input.notificationIds }, userId: request.auth.userId, readAt: null }, data: { readAt: new Date() } });
    return { updated: result.count };
  });
}
