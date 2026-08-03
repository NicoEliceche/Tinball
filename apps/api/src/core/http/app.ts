import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import localRateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../data/prisma.js';
import { HttpError } from './errors.js';
import { resolveSession, SESSION_COOKIE } from '../security/session.js';
import { registerRoutes } from '../../routes.js';

export async function buildApp() {
  const app = Fastify({ bodyLimit: 1_048_576, connectionTimeout: 10_000, requestTimeout: 15_000, logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug', redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie', '*.token', '*.idToken', '*.sessionToken'] }, trustProxy: 1, requestIdHeader: 'x-request-id' });
  await app.register(helmet, { global: true, contentSecurityPolicy: false });
  await app.register(cookie);
  await app.register(cors, { credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'Idempotency-Key', 'X-Request-Id'], origin(origin, callback) { if (!origin || env.corsOrigins.includes(origin)) callback(null, true); else callback(new Error('Origin not allowed'), false); } });
  await app.register(localRateLimit, { global: true, max: env.NODE_ENV === 'production' ? 300 : 1000, timeWindow: '1 minute', errorResponseBuilder: (request) => ({ error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes.', requestId: request.id } }) });
  app.decorateRequest('auth', null);
  app.addHook('onRequest', async (request) => {
    const mutatesState = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    if (!mutatesState || !request.cookies[SESSION_COOKIE]) return;
    const origin = request.headers.origin;
    if (!origin || !env.corsOrigins.includes(origin)) throw new HttpError(403, 'CSRF_REJECTED', 'El origen de la solicitud no está autorizado.');
  });
  app.addHook('onRequest', resolveSession);
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) { void reply.code(error.statusCode).send({ error: { code: error.code, message: error.message, requestId: request.id, fieldErrors: error.fieldErrors } }); return; }
    if (error instanceof ZodError) { const flattened = error.flatten(); void reply.code(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Revisá los datos enviados.', requestId: request.id, fieldErrors: flattened.fieldErrors } }); return; }
    if ((error as { statusCode?: number }).statusCode === 429) { void reply.code(429).send({ error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes.', requestId: request.id } }); return; }
    request.log.error({ err: error }, 'Unhandled request error');
    void reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.', requestId: request.id } });
  });
  await registerRoutes(app);
  app.addHook('onClose', async () => prisma.$disconnect());
  return app;
}
