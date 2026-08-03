import { SendMessageSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../../core/config/env.js';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const Params = z.object({ id: z.string().min(1) });
async function requireMembership(conversationId: string, userId: string) {
  const membership = await prisma.conversationMember.findUnique({ where: { conversationId_userId: { conversationId, userId } }, include: { conversation: { select: { closedAt: true } } } });
  if (!membership || membership.leftAt) throw forbidden('No pertenecés a esta conversación.');
  if (membership.conversation.closedAt) throw forbidden('Esta conversación está cerrada.');
  return membership;
}
export async function chatRoutes(app: FastifyInstance) {
  app.get('/api/v1/conversations', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const memberships = await prisma.conversationMember.findMany({ where: { userId: request.auth.userId, leftAt: null }, include: { conversation: { include: { messages: { where: { deletedAt: null, OR: [{ moderationStatus: 'APPROVED' }, { senderId: request.auth.userId, moderationStatus: 'PENDING' }] }, orderBy: { createdAt: 'desc' }, take: 1, select: { text: true, createdAt: true } } } } }, orderBy: { conversation: { updatedAt: 'desc' } }, take: 50 });
    return { items: memberships.map((membership) => ({ id: membership.conversation.id, kind: membership.conversation.kind, scopeRefId: membership.conversation.scopeRefId, title: membership.conversation.title, lastMessage: membership.conversation.messages[0] ?? null, lastReadAt: membership.lastReadAt })) };
  });
  app.get('/api/v1/conversations/:id/messages', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized(); const { id } = Params.parse(request.params); await requireMembership(id, request.auth.userId);
    const messages = await prisma.message.findMany({ where: { conversationId: id, deletedAt: null, OR: [{ moderationStatus: 'APPROVED' }, { senderId: request.auth.userId, moderationStatus: 'PENDING' }] }, include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } }, orderBy: { createdAt: 'asc' }, take: 200 });
    await prisma.conversationMember.update({ where: { conversationId_userId: { conversationId: id, userId: request.auth.userId } }, data: { lastReadAt: new Date() } });
    return { items: messages };
  });
  app.post('/api/v1/conversations/:id/messages', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return; if (!request.auth) throw unauthorized(); const { id } = Params.parse(request.params); const input = SendMessageSchema.parse(request.body); await requireMembership(id, request.auth.userId);
    const existing = await prisma.message.findUnique({ where: { clientId: input.clientId }, include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } } });
    if (existing) {
      if (existing.conversationId === id && existing.senderId === request.auth.userId && existing.text === input.text) return existing;
      throw conflict('Ese identificador de mensaje ya fue utilizado.');
    }
    const message = await prisma.message.create({ data: { clientId: input.clientId, conversationId: id, senderId: request.auth.userId, text: input.text, moderationStatus: env.NODE_ENV === 'production' ? 'PENDING' : 'APPROVED' }, include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } } });
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'chat.message.create', outcome: 'success', targetType: 'conversation', targetId: id, requestId: request.id, ip: request.ip, metadata: { messageId: message.id } });
    return reply.code(201).send(message);
  });
}
