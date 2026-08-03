import { Prisma } from '@prisma/client';
import { CreateBookingSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../core/data/prisma.js';
import { conflict, forbidden, notFound, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { featureFlags } from '../../core/security/featureFlags.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { requireOnboarded } from '../../core/security/session.js';

const Params = z.object({ id: z.string().min(1) });

export async function venueRoutes(app: FastifyInstance) {
  app.get('/api/v1/venues/:id', { preHandler: requireOnboarded }, async (request) => {
    const { id } = Params.parse(request.params);
    const venue = await prisma.venue.findUnique({ where: { id }, include: { fields: { where: { active: true }, orderBy: { name: 'asc' } }, reviews: { where: { verifiedAttendance: true, moderationStatus: 'APPROVED' }, include: { user: { select: { id: true, displayName: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' }, take: 30 } } });
    if (!venue) throw notFound('Cancha');
    return venue;
  });

  app.post('/api/v1/venues/bookings', { preHandler: [requireOnboarded, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    if (!featureFlags.venueBookings) throw forbidden('Las reservas desde Tinball todavía no están habilitadas.');
    const input = CreateBookingSchema.parse(request.body);
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    const durationMinutes = Math.ceil((endsAt.getTime() - startsAt.getTime()) / 60_000);
    if (startsAt.getTime() < Date.now() + 60 * 60 * 1000) throw conflict('La reserva debe hacerse con al menos una hora de anticipación.');
    if (durationMinutes < 30 || durationMinutes > 240) throw conflict('La duración debe estar entre 30 minutos y 4 horas.');
    const field = await prisma.venueField.findFirst({ where: { id: input.fieldId, active: true }, include: { venue: { select: { id: true, name: true } } } });
    if (!field) throw notFound('Cancha');
    if (input.matchId) {
      const match = await prisma.match.findFirst({ where: { id: input.matchId, AND: [{ OR: [{ creatorId: request.auth.userId }, { participants: { some: { userId: request.auth.userId } } }] }, { OR: [{ venueId: null }, { venueId: field.venueId }] }] }, select: { id: true } });
      if (!match) throw forbidden('No podés asociar la reserva a ese partido.');
    }
    const totalMinor = Math.ceil(field.hourlyPriceMinor * durationMinutes / 60);
    try {
      const booking = await prisma.booking.create({ data: { venueId: field.venueId, fieldId: field.id, userId: request.auth.userId, matchId: input.matchId, startsAt, endsAt, status: 'HOLD', holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000), totalMinor, currency: field.currency } });
      await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'venue.booking.hold', outcome: 'success', targetType: 'booking', targetId: booking.id, requestId: request.id, ip: request.ip, metadata: { fieldId: field.id, startsAt: startsAt.toISOString(), totalMinor } });
      return reply.code(201).send({ booking, venueName: field.venue.name });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2004')) throw conflict('Ese horario acaba de ser reservado. Elegí otro turno.');
      throw error;
    }
  });
}
