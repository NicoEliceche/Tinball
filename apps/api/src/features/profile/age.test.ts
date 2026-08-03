import { describe, expect, it } from 'vitest';
import { ageOnDate } from './routes.js';

describe('ageOnDate', () => {
  it('does not increment age before the birthday', () => {
    expect(ageOnDate(new Date('2010-08-03T00:00:00.000Z'), new Date('2026-08-02T12:00:00.000Z'))).toBe(15);
  });

  it('increments age on the birthday', () => {
    expect(ageOnDate(new Date('2010-08-02T00:00:00.000Z'), new Date('2026-08-02T12:00:00.000Z'))).toBe(16);
  });
});
