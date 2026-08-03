import { describe, expect, it } from 'vitest';
import { formatLabels, formatMoney, positionLabels, skillLabels } from '../src/shared/utils/format';

describe('mobile formatting', () => {
  it('formats monetary minor units without floating point storage', () => {
    expect(formatMoney(500_000, 'ARS')).toContain('5.000');
  });

  it('ships complete Spanish football labels', () => {
    expect(positionLabels.GOALKEEPER).toBe('Arquero');
    expect(formatLabels.ELEVEN_A_SIDE).toBe('Fútbol 11');
    expect(skillLabels.COMPETITIVE).toBe('Competitivo');
  });
});
