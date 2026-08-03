import { AppealSuspensionSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { authenticate } from '../../core/security/session.js';

const Params = z.object({ id: z.string().min(1) });

export async function suspensionRoutes(app: FastifyInstance) {
  app.get('/api/v1/suspensions/me', { preHandler: authenticate }, async (request) => {
    if (!request.auth) throw unauthorized();
    const items = await prisma.suspension.findMany({ where: { userId: request.auth.userId, status: { in: ['ACTIVE', 'APPEALED'] } }, select: { id: true, status: true, reason: true, startsAt: true, endsAt: true, appealedAt: true }, orderBy: { startsAt: 'desc' } });
    return { items };
  });

  app.post('/api/v1/suspensions/:id/appeal', { preHandler: [authenticate, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const { id } = Params.parse(request.params);
    const input = AppealSuspensionSchema.parse(request.body);
    const result = await prisma.suspension.updateMany({ where: { id, userId: request.auth.userId, status: 'ACTIVE' }, data: { status: 'APPEALED', appealedAt: new Date(), appealReason: input.reason } });
    if (result.count !== 1) {
      const suspension = await prisma.suspension.findUnique({ where: { id }, select: { status: true, userId: true } });
      if (!suspension || suspension.userId !== request.auth.userId) throw notFound('Suspensión');
      throw conflict('La suspensión ya fue apelada o resuelta.');
    }
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'suspension.appeal', outcome: 'success', targetType: 'suspension', targetId: id, requestId: request.id, ip: request.ip });
    return { id, status: 'APPEALED' };
  });
}
