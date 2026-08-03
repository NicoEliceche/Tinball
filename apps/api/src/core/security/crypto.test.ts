import { describe, expect, it } from 'vitest';
import { createAuditHash, createOpaqueToken, hashPrivateValue, hashSessionToken, safeEqual, sha256 } from './crypto.js';

describe('security crypto helpers', () => {
  it('creates high-entropy opaque session tokens', () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).toHaveLength(43);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('uses purpose-specific deterministic hashes without exposing input', () => {
    expect(hashSessionToken('token')).toHaveLength(64);
    expect(hashPrivateValue('127.0.0.1')).toHaveLength(64);
    expect(createAuditHash('event')).toHaveLength(64);
    expect(hashSessionToken('token')).not.toBe(sha256('token'));
  });

  it('compares equal values without accepting different lengths', () => {
    expect(safeEqual('same-value', 'same-value')).toBe(true);
    expect(safeEqual('same-value', 'other-value')).toBe(false);
    expect(safeEqual('short', 'longer')).toBe(false);
  });
});
