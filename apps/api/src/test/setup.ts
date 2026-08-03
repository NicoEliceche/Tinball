process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/tinball_test';
process.env.DIRECT_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
process.env.SESSION_PEPPER = process.env.SESSION_PEPPER ?? 'test-session-pepper-at-least-thirty-two-characters';
process.env.AUDIT_HASH_SECRET = process.env.AUDIT_HASH_SECRET ?? 'test-audit-secret-at-least-thirty-two-characters';
process.env.IP_HASH_SECRET = process.env.IP_HASH_SECRET ?? 'test-private-secret-at-least-thirty-two-chars';
process.env.GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID ?? 'test.apps.googleusercontent.com';

