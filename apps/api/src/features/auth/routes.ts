import { AuthPlatform, Prisma } from '@prisma/client';
import { GoogleAuthRequestSchema, type AuthResponse, type AuthUser } from '@tinball/contracts';
import type { FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../core/config/env.js';
import { prisma } from '../../core/data/prisma.js';
import { conflict, unauthorized } from '../../core/http/errors.js';
import { writeAudit } from '../../core/security/audit.js';
import { hashPrivateValue } from '../../core/security/crypto.js';
import { loginRateLimit } from '../../core/security/rateLimit.js';
import { authenticate, clearWebSessionCookie, createSession, revokeCurrentSession, setWebSessionCookie } from '../../core/security/session.js';

const google = new OAuth2Client();
const platformMap = { android: AuthPlatform.ANDROID, ios: AuthPlatform.IOS, web: AuthPlatform.WEB } as const;
const responsePlatformMap = { ANDROID: 'android', IOS: 'ios', WEB: 'web' } as const;

function publicUser(user: { id: string; email: string; displayName: string; avatarUrl: string | null; onboardingComplete: boolean; role: 'PLAYER' | 'VENUE_MANAGER' | 'MODERATOR' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED' | 'DELETION_PENDING' | 'DELETED'; subscriptions?: Array<{ id: string }> }): AuthUser {
  if (user.status !== 'ACTIVE' && user.status !== 'SUSPENDED') throw unauthorized();
  return { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, onboardingComplete: user.onboardingComplete, isPremium: Boolean(user.subscriptions?.length), role: user.role, accountStatus: user.status };
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/v1/auth/google', { preHandler: loginRateLimit }, async (request, reply) => {
    if (reply.sent) return;
    const input = GoogleAuthRequestSchema.parse(request.body);
    let payload;
    try {
      const ticket = await google.verifyIdToken({ idToken: input.idToken, audience: env.googleAudiences });
      payload = ticket.getPayload();
    } catch {
      await writeAudit({ action: 'auth.google', outcome: 'denied', requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'], metadata: { reason: 'invalid_google_token', platform: input.platform } });
      throw unauthorized();
    }
    if (!payload?.sub || !payload.email || payload.email_verified !== true) throw unauthorized();
    const verifiedPayload = { ...payload, sub: payload.sub, email: payload.email };

    const user = await prisma.$transaction(async (tx) => {
      const identity = await tx.oAuthIdentity.findUnique({ where: { provider_providerSub: { provider: 'google', providerSub: verifiedPayload.sub } }, include: { user: { include: { subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } } } } } });
      if (identity) {
        return tx.user.update({ where: { id: identity.userId }, data: { displayName: verifiedPayload.name?.slice(0, 80) || identity.user.displayName, avatarUrl: verifiedPayload.picture ?? identity.user.avatarUrl, lastSeenAt: new Date() }, include: { subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } } } });
      }
      const existingEmail = await tx.user.findUnique({ where: { email: verifiedPayload.email.toLowerCase() } });
      if (existingEmail) throw conflict('Ese email ya pertenece a otra identidad. Iniciá sesión desde el método original para vincular Google de forma segura.');
      return tx.user.create({ data: { email: verifiedPayload.email.toLowerCase(), displayName: (verifiedPayload.name || verifiedPayload.email.split('@')[0] || 'Jugador').slice(0, 80), avatarUrl: verifiedPayload.picture, oauthIdentities: { create: { provider: 'google', providerSub: verifiedPayload.sub, providerEmail: verifiedPayload.email.toLowerCase(), emailVerified: true } }, settings: { create: {} } }, include: { subscriptions: { select: { id: true } } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (user.status !== 'ACTIVE' && user.status !== 'SUSPENDED') throw unauthorized();

    const platform = platformMap[input.platform];
    const session = await createSession({ userId: user.id, platform, deviceName: input.deviceName, ipHash: hashPrivateValue(request.ip), userAgentHash: request.headers['user-agent'] ? hashPrivateValue(request.headers['user-agent']) : undefined });
    if (platform === AuthPlatform.WEB) setWebSessionCookie(reply, session.rawToken, session.expiresAt);
    await writeAudit({ actorUserId: user.id, sessionId: session.session.id, action: 'auth.google', outcome: 'success', targetType: 'session', targetId: session.session.id, requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'], metadata: { platform: input.platform } });
    const response: AuthResponse = { user: publicUser(user), platform: input.platform, expiresAt: session.expiresAt.toISOString(), ...(platform === AuthPlatform.WEB ? {} : { sessionToken: session.rawToken }) };
    return reply.code(200).send(response);
  });

  app.get('/api/v1/auth/me', { preHandler: authenticate }, async (request) => {
    if (!request.auth) throw unauthorized();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.auth.userId }, include: { subscriptions: { where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } }, select: { id: true } }, sessions: { where: { id: request.auth.sessionId }, select: { expiresAt: true, platform: true } } } });
    const session = user.sessions[0];
    if (!session) throw unauthorized();
    const response: AuthResponse = { user: publicUser(user), platform: responsePlatformMap[session.platform], expiresAt: session.expiresAt.toISOString() };
    return response;
  });

  app.post('/api/v1/auth/logout', { preHandler: authenticate }, async (request, reply) => {
    await revokeCurrentSession(request);
    clearWebSessionCookie(reply);
    if (request.auth) await writeAudit({ actorUserId: request.auth.userId, sessionId: request.auth.sessionId, action: 'auth.logout', outcome: 'success', targetType: 'session', targetId: request.auth.sessionId, requestId: request.id, ip: request.ip, userAgent: request.headers['user-agent'] });
    return reply.code(204).send();
  });
}
