import {describe, expect, it} from 'vitest';
import {amountToCents, buildSavingsProjection as projectEntries, getPlanMonthCount, groupSavingsProjectionByYear, isValidEntryPeriod, UNASSIGNED_ACCOUNT} from './savingsPlan';

const buildSavingsProjection = (start: string, end: string, incomeCents: number, expenseCents: number) => projectEntries(
  start, end, [{name: 'Income', amount: incomeCents / 100}], [{name: 'Expense', amount: expenseCents / 100}],
);

describe('savings plan', () => {
  it('uses the main account for legacy entries and keeps explicit account assignments', () => {
    const incomes = [{name: 'Salary', amount: 4000}, {name: 'Benefit', amount: 100, accountId: 'O', endMonth: '2026-11'}];
    const expenses = [{name: 'Bills', amount: 3000}, {name: 'Insurance', amount: 200, accountId: 'O'}];
    const rows = projectEntries('2026-11', '2026-12', incomes, expenses, 'J');
    expect(rows[0].accountBalances).toEqual({J: 100000, O: -10000});
    expect(rows[1].accountBalances).toEqual({J: 200000, O: -30000});
    expect(rows[1].accumulatedCents).toBe(170000);
    expect(groupSavingsProjectionByYear(rows)[0].accountBalances).toEqual(rows[1].accountBalances);
    const reassigned = projectEntries('2026-11', '2026-12', incomes, expenses, 'Other');
    expect(reassigned[0].accountBalances).toEqual({Other: 100000, O: -10000});
  });

  it('never silently moves missing explicit accounts and preserves the family total', () => {
    const rows = projectEntries('2026-11', '2026-12', [
      {name: 'Unassigned', amount: 100}, {name: 'Deleted account', amount: 50, accountId: 'missing'},
    ], []);
    expect(rows[0].accountBalances).toEqual({[UNASSIGNED_ACCOUNT]: 10000, missing: 5000});
    for (const row of rows) expect(Object.values(row.accountBalances).reduce((sum, value) => sum + value, 0)).toBe(row.accumulatedCents);
  });
  it('applies inclusive periods and sums actual monthly balances', () => {
    const rows = projectEntries('2026-11', '2027-02', [
      {name: 'Salary', amount: 1000},
      {name: 'Benefit', amount: 200, endMonth: '2026-12'},
    ], [
      {name: 'Rent', amount: 700},
      {name: 'New bill', amount: 50, startMonth: '2027-01', endMonth: '2027-01'},
    ]);
    expect(rows.map(row => row.remainingCents)).toEqual([50000, 50000, 25000, 30000]);
    expect(rows.map(row => row.accumulatedCents)).toEqual([50000, 100000, 125000, 155000]);
    expect(groupSavingsProjectionByYear(rows).map(year => year.remainingCents)).toEqual([100000, 55000]);
  });

  it('keeps unrestricted entries active when the plan changes and ignores non-overlapping entries', () => {
    const entries = [
      {name: 'Always', amount: 100, startMonth: null, endMonth: null},
      {name: 'Expired', amount: 500, endMonth: '2025-12'},
      {name: 'Future', amount: 500, startMonth: '2030-01'},
    ];
    expect(projectEntries('2026-01', '2026-02', entries, []).map(row => row.incomeCents)).toEqual([10000, 10000]);
    expect(projectEntries('2027-01', '2027-02', entries, []).map(row => row.incomeCents)).toEqual([10000, 10000]);
  });

  it('validates periods and supports a new salary starting after the old salary ends', () => {
    expect(isValidEntryPeriod({startMonth: '2027-01', endMonth: '2026-12'})).toBe(false);
    expect(isValidEntryPeriod({startMonth: 'bad'})).toBe(false);
    expect(isValidEntryPeriod({endMonth: '2027-13'})).toBe(false);
    expect(projectEntries('2026-12', '2027-01', [
      {name: 'Old salary', amount: 1000, endMonth: '2026-12'},
      {name: 'New salary', amount: 1200, startMonth: '2027-01'},
    ], []).map(row => row.incomeCents)).toEqual([100000, 120000]);
    expect(projectEntries('2026-01', '2026-02', [{name: 'Invalid', amount: 1, startMonth: 'bad'}], [])).toEqual([]);
  });

  it('groups partial and full years without double counting accumulated savings', () => {
    const years = groupSavingsProjectionByYear(buildSavingsProjection('2026-11', '2028-02', 10000, 2000));
    expect(years.map(group => group.year)).toEqual(['2026', '2027', '2028']);
    expect(years.map(group => group.months.length)).toEqual([2, 12, 2]);
    expect(years[0]).toMatchObject({incomeCents: 20000, expenseCents: 4000, remainingCents: 16000, accumulatedCents: 16000});
    expect(years[1]).toMatchObject({incomeCents: 120000, expenseCents: 24000, remainingCents: 96000, accumulatedCents: 112000});
    expect(years[2].accumulatedCents).toBe(128000);
  });

  it('groups zero budgets, deficits and empty forecasts', () => {
    expect(groupSavingsProjectionByYear([])).toEqual([]);
    expect(groupSavingsProjectionByYear(buildSavingsProjection('2026-11', '2026-12', 0, 0))[0].accumulatedCents).toBe(0);
    expect(groupSavingsProjectionByYear(buildSavingsProjection('2026-11', '2027-01', 100, 150))[1])
      .toMatchObject({remainingCents: -50, accumulatedCents: -150});
  });

  it('accepts dot/comma decimals and treats an empty amount as zero', () => {
    expect(amountToCents('123,45')).toBe(12345);
    expect(amountToCents('0.29')).toBe(29);
    expect(amountToCents('')).toBe(0);
  });

  it('rejects negative, non-finite, excessive and malformed amounts', () => {
    for (const value of [-1, Infinity, NaN, 'abc', '.', ',', '1.234', '1e4', 1_000_000_001]) {
      expect(amountToCents(value)).toBeNull();
    }
  });

  it('includes the first and last month and handles year boundaries', () => {
    const rows = buildSavingsProjection('2026-11', '2027-01', 400000, 320000);
    expect(rows.map(row => row.month)).toEqual(['2026-11', '2026-12', '2027-01']);
    expect(rows.map(row => row.accumulatedCents)).toEqual([80000, 160000, 240000]);
    expect(rows[0].incomeCents).toBe(400000);
    expect(rows[0].expenseCents).toBe(320000);
  });

  it('produces exactly 60 months for a five-year plan', () => {
    expect(getPlanMonthCount('2026-11', '2031-10')).toBe(60);
  });

  it('supports a single month, zero budget and negative balances', () => {
    expect(buildSavingsProjection('2026-11', '2026-11', 0, 0)[0].accumulatedCents).toBe(0);
    expect(buildSavingsProjection('2026-11', '2026-12', 100, 150)[1].accumulatedCents).toBe(-100);
  });

  it('does not accumulate floating point rounding errors', () => {
    const rows = buildSavingsProjection('2026-01', '2030-12', amountToCents('0.30')!, amountToCents('0.20')!);
    expect(rows.at(-1)?.accumulatedCents).toBe(600);
  });

  it('rejects missing, malformed, reversed and excessively long periods', () => {
    for (const [start, end] of [
      ['', '2026-11'], ['2026-13', '2027-01'], ['2026-01', '2026-00'],
      ['2026-11', '2026-10'], ['2026-01', '2126-01'], ['bad', '2026-11'],
    ]) {
      expect(buildSavingsProjection(start, end, 0, 0)).toEqual([]);
    }
    expect(buildSavingsProjection('2026-01', '2026-02', NaN, 0)).toEqual([]);
  });
});
