import { CompleteProfileSchema, UpdateSettingsSchema } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../core/data/prisma.js';
import { HttpError, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { mutationRateLimit } from '../../core/security/rateLimit.js';
import { authenticate } from '../../core/security/session.js';

export function ageOnDate(birthDate: Date, now: Date): number {
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < birthDate.getUTCMonth() || (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export async function profileRoutes(app: FastifyInstance) {
  app.get('/api/v1/profile/me', { preHandler: authenticate }, async (request) => {
    if (!request.auth) throw unauthorized();
    const user = await prisma.user.findUnique({
      where: { id: request.auth.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        onboardingComplete: true,
        profile: true,
        settings: true,
        subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { currentPeriodEnd: true }, take: 1 },
        teamMemberships: {
          where: { status: 'ACTIVE' },
          select: {
            role: true,
            team: {
              select: {
                id: true,
                name: true,
                locality: true,
                crestUrl: true,
                crestColor: true,
                format: true,
                rankPoints: true,
                isVerified: true,
                _count: { select: { members: { where: { status: 'ACTIVE' } } } },
              },
            },
          },
        },
        _count: { select: { reviewsReceived: true, matchParticipations: true, referralsMade: true } },
      },
    });
    if (!user) throw unauthorized();
    const points = await prisma.pointsLedgerEntry.findFirst({ where: { userId: user.id }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { balanceAfter: true } });
    return { ...user, rewardPoints: points?.balanceAfter ?? 0, isPremium: user.subscriptions.length > 0 };
  });

  app.put('/api/v1/profile/onboarding', { preHandler: [authenticate, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = CompleteProfileSchema.parse(request.body);
    const birthDate = new Date(`${input.birthDate}T00:00:00.000Z`);
    if (ageOnDate(birthDate, new Date()) < 16) throw new HttpError(422, 'MINIMUM_AGE', 'Tenés que tener al menos 16 años para usar Tinball.');
    const user = await prisma.$transaction(async (tx) => {
      await tx.playerProfile.upsert({ where: { userId: request.auth!.userId }, create: { userId: request.auth!.userId, birthDate, locality: input.locality, province: input.province, primaryPosition: input.primaryPosition, secondaryPositions: input.secondaryPositions, skillLevel: input.skillLevel, preferredFoot: input.preferredFoot, bio: input.bio }, update: { birthDate, locality: input.locality, province: input.province, primaryPosition: input.primaryPosition, secondaryPositions: input.secondaryPositions, skillLevel: input.skillLevel, preferredFoot: input.preferredFoot, bio: input.bio } });
      return tx.user.update({ where: { id: request.auth!.userId }, data: { displayName: input.displayName, onboardingComplete: true }, include: { subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } } } });
    });
    await writeAudit({ actorUserId: user.id, sessionId: request.auth.sessionId, action: 'profile.onboarding.complete', outcome: 'success', targetType: 'user', targetId: user.id, requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'] });
    return { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, onboardingComplete: user.onboardingComplete, isPremium: user.subscriptions.length > 0, role: user.role, accountStatus: user.status };
  });

  app.put('/api/v1/profile/settings', { preHandler: [authenticate, mutationRateLimit] }, async (request, reply) => {
    if (reply.sent) return;
    if (!request.auth) throw unauthorized();
    const input = UpdateSettingsSchema.parse(request.body);
    const settings = await prisma.userSettings.upsert({ where: { userId: request.auth.userId }, create: { userId: request.auth.userId, ...input }, update: input });
    await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'profile.settings.update', outcome: 'success', targetType: 'userSettings', targetId: settings.id, requestId: request.id, ip: request.ip });
    return settings;
  });
}
