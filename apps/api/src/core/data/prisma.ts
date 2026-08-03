import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

const globalPrisma = globalThis as unknown as { tinballPrisma?: PrismaClient };
export const prisma = globalPrisma.tinballPrisma ?? new PrismaClient({ log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] });
if (env.NODE_ENV !== 'production') globalPrisma.tinballPrisma = prisma;

