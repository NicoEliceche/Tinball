import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

export function createOpaqueToken(): string { return randomBytes(32).toString('base64url'); }
export function hashSessionToken(token: string): string { return createHmac('sha256', env.SESSION_PEPPER).update(token).digest('hex'); }
export function hashPrivateValue(value: string): string { return createHmac('sha256', env.IP_HASH_SECRET).update(value).digest('hex'); }
export function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }
export function safeEqual(a: string, b: string): boolean { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right); }
export function createAuditHash(input: string): string { return createHmac('sha256', env.AUDIT_HASH_SECRET).update(input).digest('hex'); }

