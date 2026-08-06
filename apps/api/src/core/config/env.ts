import 'dotenv/config';
import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');
const defaultProductionWebOrigin = 'https://nicoeliceche.github.io';

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  SESSION_PEPPER: z.string().min(32),
  AUDIT_HASH_SECRET: z.string().min(32),
  IP_HASH_SECRET: z.string().min(32),
  GOOGLE_WEB_CLIENT_ID: z.string().min(10),
  GOOGLE_ANDROID_CLIENT_ID: z.string().min(10).optional(),
  GOOGLE_IOS_CLIENT_ID: z.string().min(10).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:8081'),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(10).optional(),
  WORKER_SECRET: z.string().min(32).optional(),
  SECURITY_ALERT_WEBHOOK_URL: z.url().optional(),
  SECURITY_ALERT_WEBHOOK_TOKEN: z.string().min(16).optional(),
  ENABLE_PRIZE_LOBBIES: booleanString.default(false),
  ENABLE_REFERRAL_PAYOUTS: booleanString.default(false),
  ENABLE_VENUE_BOOKINGS: booleanString.default(false),
  ENABLE_PREMIUM_PURCHASES: booleanString.default(false),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid server environment: ${details}`);
}

const corsOrigins = Array.from(new Set([
  ...parsed.data.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean).map(normalizeOrigin).filter((origin): origin is string => Boolean(origin)),
  ...(parsed.data.NODE_ENV === 'production' ? [defaultProductionWebOrigin] : []),
]));

export const env = {
  ...parsed.data,
  corsOrigins,
  googleAudiences: [parsed.data.GOOGLE_WEB_CLIENT_ID, parsed.data.GOOGLE_ANDROID_CLIENT_ID, parsed.data.GOOGLE_IOS_CLIENT_ID].filter((value): value is string => Boolean(value)),
};
