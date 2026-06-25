import { describe, expect, it } from 'vitest';
import { calculateSm2 } from './sm2';

const BASE_DATE = new Date('2025-01-01T12:00:00.000Z');

describe('calculateSm2', () => {
  it('resets on forget (q=0)', () => {
    const result = calculateSm2(0, 5, 30, 2.5, BASE_DATE);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.nextReview.toISOString()).toBe('2025-01-02T12:00:00.000Z');
  });

  it('sets interval to 1 on first successful review', () => {
    const result = calculateSm2(2, 0, 0, 2.5, BASE_DATE);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('sets interval to 6 on second successful review', () => {
    const result = calculateSm2(2, 1, 1, 2.5, BASE_DATE);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.nextReview.toISOString()).toBe('2025-01-07T12:00:00.000Z');
  });

  it('multiplies interval by easiness factor on third+ review', () => {
    const result = calculateSm2(3, 2, 6, 2.5, BASE_DATE);
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(15);
  });

  it('enforces minimum easiness factor of 1.3', () => {
    const result = calculateSm2(0, 0, 0, 1.3, BASE_DATE);
    expect(result.easinessFactor).toBeGreaterThanOrEqual(1.3);
  });
});
