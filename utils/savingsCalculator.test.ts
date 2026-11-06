import {describe, expect, it} from 'vitest';
import {calculateSavings} from './savingsCalculator';

describe('savings calculator', () => {
  it('calculates in cents and counts the horizon from the current month', () => {
    expect(calculateSavings('1000.25', '200,10', 60, new Date(2026, 10, 6))).toEqual({
      initialCents: 100025, addedCents: 1200600, totalCents: 1300625, targetMonth: '2031-11',
    });
  });
  it('supports zero savings and does not skip February when starting on January 31', () => {
    expect(calculateSavings(0, 0, 1, new Date(2026, 0, 31))).toMatchObject({totalCents: 0, targetMonth: '2026-02'});
  });
  it('accepts manual values above slider limits', () => {
    expect(calculateSavings(0, 5000, 500)?.totalCents).toBe(250000000);
  });
  it('rejects negative, blank, malformed and excessive inputs', () => {
    for (const value of ['', '-1', 'abc', '1.234', '1000000001']) {
      expect(calculateSavings(value, 0, 60)).toBeNull();
      expect(calculateSavings(0, value, 60)).toBeNull();
    }
    for (const count of ['', 0, -1, 1.5, 1201, '1e2', Infinity]) {
      expect(calculateSavings(0, 100, count)).toBeNull();
    }
  });
});
