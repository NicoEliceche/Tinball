import type { Prisma } from '@prisma/client';
import { prisma } from '../data/prisma.js';
import { createAuditHash, hashPrivateValue } from './crypto.js';

interface AuditInput {
  actorUserId?: string;
  sessionId?: string;
  action: string;
  outcome: 'success' | 'denied' | 'failure';
  targetType?: string;
  targetId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function writeAudit(input: AuditInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(746622411)`;
    const previous = await tx.securityAuditEvent.findFirst({ orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }], select: { eventHash: true } });
    const occurredAt = new Date();
    const canonical = JSON.stringify({ occurredAt: occurredAt.toISOString(), actorUserId: input.actorUserId ?? null, action: input.action, outcome: input.outcome, targetType: input.targetType ?? null, targetId: input.targetId ?? null, previousHash: previous?.eventHash ?? null });
    await tx.securityAuditEvent.create({ data: { occurredAt, actorUserId: input.actorUserId, sessionId: input.sessionId, action: input.action, outcome: input.outcome, targetType: input.targetType, targetId: input.targetId, requestId: input.requestId, ipHash: input.ip ? hashPrivateValue(input.ip) : undefined, userAgentHash: input.userAgent ? hashPrivateValue(input.userAgent) : undefined, metadata: input.metadata, previousHash: previous?.eventHash, eventHash: createAuditHash(canonical) } });
  });
}
