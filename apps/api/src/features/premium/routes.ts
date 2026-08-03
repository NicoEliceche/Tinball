import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

export async function premiumRoutes(app: FastifyInstance) {
  app.post('/api/v1/premium/interest', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const interest = await prisma.premiumInterest.upsert({ where: { userId: request.auth.userId }, create: { userId: request.auth.userId, platform: request.auth.platform }, update: { platform: request.auth.platform } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'premium.interest.register', outcome: 'success', targetType: 'premiumInterest', targetId: interest.id, requestId: request.id, ip: request.ip });
    return reply.code(201).send({ registered: true, createdAt: interest.createdAt });
  });
}
