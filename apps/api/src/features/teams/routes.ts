import { randomBytes } from 'node:crypto';
import { CreateTeamSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { requireOnboarded } from '../../core/security/session.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { writeAudit } from '../../core/security/audit.js';

const Params = z.object({ id: z.string().min(1) });

export async function teamRoutes(app: FastifyInstance) {
  app.post('/api/v1/teams', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = CreateTeamSchema.parse(request.body);
    const captainedTeams = await prisma.teamMember.count({ where: { userId: request.auth.userId, role: 'CAPTAIN', status: 'ACTIVE' } });
    if (captainedTeams >= 10) throw conflict('Alcanzaste el máximo de 10 equipos administrados como capitán.');
    const slugBase = input.name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'equipo';
    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({ data: { name: input.name, slug: `${slugBase}-${randomBytes(4).toString('hex')}`, locality: input.locality, format: input.format, crestColor: input.crestColor, members: { create: { userId: request.auth!.userId, role: 'CAPTAIN', status: 'ACTIVE', joinedAt: new Date() } } } });
      const conversation = await tx.conversation.create({ data: { kind: 'TEAM', scopeRefId: team.id, title: team.name, members: { create: { userId: request.auth!.userId } } } });
      return { ...team, memberCount: 1, conversationId: conversation.id };
    });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'team.create', outcome: 'success', targetType: 'team', targetId: result.id, requestId: request.id, ip: request.ip });
    return reply.code(201).send(result);
  });

  app.get('/api/v1/teams/:id', { preHandler: requireOnboarded }, async (request) => {
    if (!request.auth) throw unauthorized();
    const { id } = Params.parse(request.params);
    const membership = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId: id, userId: request.auth.userId } }, select: { status: true, role: true } });
    if (membership?.status !== 'ACTIVE') throw forbidden('El plantel completo sólo es visible para miembros activos.');
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: { where: { status: 'ACTIVE' }, include: { user: { select: { id: true, displayName: true, avatarUrl: true, profile: { select: { primaryPosition: true, skillLevel: true, ratingAverage: true, reliabilityScore: true } } } } }, orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }] },
        homeMatches: { where: { startsAt: { gte: new Date() }, status: { notIn: ['CANCELLED', 'COMPLETED'] } }, select: { id: true, title: true, startsAt: true, status: true }, take: 5, orderBy: { startsAt: 'asc' } },
        awayMatches: { where: { startsAt: { gte: new Date() }, status: { notIn: ['CANCELLED', 'COMPLETED'] } }, select: { id: true, title: true, startsAt: true, status: true }, take: 5, orderBy: { startsAt: 'asc' } },
      },
    });
    if (!team) throw notFound('Equipo');
    const completed = await prisma.match.findMany({ where: { status: 'COMPLETED', resultStatus: 'CONFIRMED', OR: [{ homeTeamId: id }, { awayTeamId: id }] }, select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true } });
    const stats = completed.reduce((current, match) => {
      if (match.homeScore == null || match.awayScore == null) return current;
      if (match.homeScore === match.awayScore) current.draws += 1;
      else if ((match.homeTeamId === id && match.homeScore > match.awayScore) || (match.awayTeamId === id && match.awayScore > match.homeScore)) current.wins += 1;
      else current.losses += 1;
      return current;
    }, { wins: 0, draws: 0, losses: 0 });
    return { ...team, stats, canManage: membership.role === 'CAPTAIN' || membership.role === 'ADMIN' };
  });
}
