import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { hashPrivateValue } from './crypto.js';

const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }) : null;
const loginLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'tinball:login', analytics: true }) : null;
const mutationLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(80, '1 m'), prefix: 'tinball:mutation', analytics: true }) : null;
const checkInLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '5 m'), prefix: 'tinball:checkin', analytics: true }) : null;

function guard(limiter: Ratelimit | null, scope: string) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!limiter) {
      if (env.NODE_ENV === 'production') {
        await reply.code(503).send({ error: { code: 'SECURITY_DEPENDENCY_UNAVAILABLE', message: 'Servicio temporalmente no disponible.', requestId: request.id } });
      }
      return;
    }
    const identity = request.auth?.userId ?? hashPrivateValue(request.ip);
    const result = await limiter.limit(`${scope}:${identity}`);
    reply.header('RateLimit-Limit', result.limit).header('RateLimit-Remaining', result.remaining).header('RateLimit-Reset', result.reset);
    if (!result.success) await reply.code(429).send({ error: { code: 'RATE_LIMITED', message: 'Demasiados intentos. Esperá un momento.', requestId: request.id } });
  };
}

export const loginRateLimit = guard(loginLimiter, 'google');
export const mutationRateLimit = guard(mutationLimiter, 'write');
export const checkInRateLimit = guard(checkInLimiter, 'code');
export const redisSecurityReady = Boolean(redis);
