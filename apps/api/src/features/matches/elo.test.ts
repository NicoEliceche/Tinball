import { describe, expect, it } from 'vitest';
import { calculateEloDelta } from './routes.js';

describe('calculateEloDelta', () => {
  it('is symmetric for equally ranked opponents', () => {
    expect(calculateEloDelta(1200, 1200, 1).delta).toBe(16);
    expect(calculateEloDelta(1200, 1200, 0).delta).toBe(-16);
    expect(calculateEloDelta(1200, 1200, 0.5).delta).toBe(0);
  });

  it('rewards an upset more than an expected win', () => {
    const underdog = calculateEloDelta(900, 1300, 1).delta;
    const favorite = calculateEloDelta(1300, 900, 1).delta;
    expect(underdog).toBeGreaterThan(favorite);
    expect(favorite).toBeGreaterThan(0);
  });
});
