import type { AuthPlatform, User } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../data/prisma.js';
import { forbidden, unauthorized } from '../http/errors.js';
import { createOpaqueToken, hashSessionToken } from './crypto.js';

export const SESSION_COOKIE = 'tinball_session';
const SESSION_DAYS = 30;
const webCookieSameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

export async function createSession(input: { userId: string; platform: AuthPlatform; deviceName?: string; ipHash?: string; userAgentHash?: string }) {
  const rawToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({ data: { userId: input.userId, tokenHash: hashSessionToken(rawToken), platform: input.platform, deviceName: input.deviceName, ipHash: input.ipHash, userAgentHash: input.userAgentHash, expiresAt } });
  return { rawToken, session, expiresAt };
}

export function setWebSessionCookie(reply: FastifyReply, token: string, expiresAt: Date): void {
  reply.setCookie(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: webCookieSameSite, path: '/', expires: expiresAt });
}

export function clearWebSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: webCookieSameSite, path: '/' });
}

function extractToken(request: FastifyRequest): string | null {
  const bearer = request.headers.authorization;
  if (bearer?.startsWith('Bearer ')) return bearer.slice(7).trim();
  return request.cookies[SESSION_COOKIE] ?? null;
}

export async function resolveSession(request: FastifyRequest): Promise<void> {
  request.auth = null;
  const token = extractToken(request);
  if (!token || token.length < 32 || token.length > 256) return;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashSessionToken(token) }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || !['ACTIVE', 'SUSPENDED'].includes(session.user.status)) return;
  request.auth = { userId: session.userId, sessionId: session.id, platform: session.platform, user: { id: session.user.id, email: session.user.email, displayName: session.user.displayName, avatarUrl: session.user.avatarUrl, role: session.user.role, status: session.user.status, onboardingComplete: session.user.onboardingComplete } };
  if (Date.now() - session.lastUsedAt.getTime() > 60 * 60 * 1000) {
    void prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);
  }
}

export async function authenticate(request: FastifyRequest): Promise<void> {
  if (!request.auth) throw unauthorized();
}

export async function requireOnboarded(request: FastifyRequest): Promise<void> {
  await authenticate(request);
  if (request.auth?.user.status !== 'ACTIVE') throw forbidden('Tu cuenta está suspendida temporalmente.');
  if (!request.auth?.user.onboardingComplete) {
    throw forbidden('Completá tu perfil antes de usar esta función.');
  }
}

export function requireRoles(...roles: User['role'][]) {
  return async (request: FastifyRequest): Promise<void> => {
    await authenticate(request);
    if (!request.auth || !roles.includes(request.auth.user.role)) throw forbidden();
  };
}

export async function revokeCurrentSession(request: FastifyRequest): Promise<void> {
  if (!request.auth) return;
  await prisma.session.updateMany({ where: { id: request.auth.sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
}
