import type { FastifyInstance } from 'fastify';
import { env } from '../../core/config/env.js';
import { prisma } from '../../core/data/prisma.js';
import { featureFlags } from '../../core/security/featureFlags.js';
import { redisSecurityReady } from '../../core/security/rateLimit.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/api/v1/health', { config: { rateLimit: false } }, async (_request, reply) => {
    let databaseReady = false;
    try { await prisma.$queryRaw`SELECT 1`; databaseReady = true; } catch { databaseReady = false; }
    const productionSecurityReady = env.NODE_ENV !== 'production' || redisSecurityReady;
    const ready = databaseReady && productionSecurityReady;
    return reply.code(ready ? 200 : 503).send({ status: ready ? 'ok' : 'degraded', version: '0.1.0', databaseReady, securityReady: productionSecurityReady, features: featureFlags, timestamp: new Date().toISOString() });
  });
}

