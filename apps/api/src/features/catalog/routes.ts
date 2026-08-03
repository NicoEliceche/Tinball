import { CursorPaginationSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { requireOnboarded } from '../../core/security/session.js';

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/api/v1/rewards', { preHandler: requireOnboarded }, async () => ({ items: await prisma.reward.findMany({ where: { active: true, OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] }] }, orderBy: [{ pointsCost: 'asc' }, { createdAt: 'desc' }], take: 50 }) }));
  app.get('/api/v1/venues', { preHandler: requireOnboarded }, async (request) => { const query = CursorPaginationSchema.parse(request.query); const items = await prisma.venue.findMany({ include: { fields: { where: { active: true }, select: { format: true, indoor: true } } }, orderBy: [{ isSponsored: 'desc' }, { ratingAverage: 'desc' }], take: query.limit, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}) }); return { items, nextCursor: items.length === query.limit ? items.at(-1)?.id : undefined }; });
  app.get('/api/v1/rankings/current', { preHandler: requireOnboarded }, async () => { const period = await prisma.rankingPeriod.findFirst({ where: { kind: 'MONTHLY', startsAt: { lte: new Date() }, endsAt: { gt: new Date() } }, include: { entries: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } }, orderBy: { points: 'desc' }, take: 100 } }, orderBy: { startsAt: 'desc' } }); return { period }; });
  app.get('/api/v1/tournaments', { preHandler: requireOnboarded }, async () => ({ items: await prisma.tournament.findMany({ where: { status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE'] } }, include: { _count: { select: { entries: { where: { status: 'CONFIRMED' } } } } }, orderBy: { startsAt: 'asc' }, take: 50 }) }));
}
