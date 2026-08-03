import { CreateReportSchema, CursorPaginationSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { conflict, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const priorityByCategory = { THREAT: 100, DISCRIMINATION: 90, UNSAFE_CONDUCT: 80, FRAUD: 70, HARASSMENT: 60, NO_SHOW: 40, FAKE_RESULT: 40, SPAM: 20, OTHER: 10 } as const;

export async function reportRoutes(app: FastifyInstance) {
  app.get('/api/v1/reports/me', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const query = CursorPaginationSchema.parse(request.query);
    const items = await prisma.report.findMany({ where: { reporterId: request.auth.userId }, select: { id: true, category: true, targetType: true, targetId: true, status: true, createdAt: true, resolvedAt: true }, orderBy: { createdAt: 'desc' }, take: query.limit, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}) });
    return { items, nextCursor: items.length === query.limit ? items.at(-1)?.id : undefined };
  });

  app.post('/api/v1/reports', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = CreateReportSchema.parse(request.body);
    if (input.reportedUserId === request.auth.userId) throw conflict('No podés reportarte a vos mismo.');
    if (input.targetType !== 'USER' && !input.targetId) throw conflict('Indicá qué contenido querés reportar.');
    const recent = await prisma.report.findFirst({ where: { reporterId: request.auth.userId, category: input.category, targetType: input.targetType, targetId: input.targetId, status: { in: ['OPEN', 'TRIAGED'] }, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } }, select: { id: true } });
    if (recent) throw conflict('Ese reporte ya está siendo revisado.');
    const report = await prisma.report.create({ data: { reporterId: request.auth.userId, reportedUserId: input.reportedUserId, category: input.category, targetType: input.targetType, targetId: input.targetId, detail: input.detail, priority: priorityByCategory[input.category] } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'report.create', outcome: 'success', targetType: 'report', targetId: report.id, requestId: request.id, ip: request.ip, metadata: { category: input.category, reportedTargetType: input.targetType } });
    return reply.code(201).send({ id: report.id, status: report.status, createdAt: report.createdAt });
  });
}
