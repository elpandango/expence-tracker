export type SavingsPlanEntry = {
  id: number;
  name: string;
  amount: number | string;
  startMonth?: string | null;
  endMonth?: string | null;
  accountId?: string | null;
};

export type SavingsPlanEntryValues = Omit<SavingsPlanEntry, 'id'>;

export const MAX_PLAN_MONTHS = 1200;
export const UNASSIGNED_ACCOUNT = 'unassigned';

export const amountToCents = (amount: number | string): number | null => {
  if (typeof amount === 'string' && !/^\d*(?:[.,]\d{0,2})?$/.test(amount.trim())) return null;
  const value = Number(String(amount).trim().replace(',', '.'));
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) return null;
  return Math.round(value * 100);
};

const monthIndex = (month: string): number | null => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [year, monthNumber] = month.split('-').map(Number);
  if (year < 1900 || year > 9999) return null;
  return year * 12 + monthNumber - 1;
};

export const getPlanMonthCount = (start: string, end: string): number => {
  const first = monthIndex(start);
  const last = monthIndex(end);
  return first === null || last === null ? 0 : Math.max(0, last - first + 1);
};

export const isValidEntryPeriod = (entry: Pick<SavingsPlanEntryValues, 'startMonth' | 'endMonth'>) => {
  if (entry.startMonth != null && monthIndex(entry.startMonth) === null) return false;
  if (entry.endMonth != null && monthIndex(entry.endMonth) === null) return false;
  return !entry.startMonth || !entry.endMonth || entry.startMonth <= entry.endMonth;
};

export const getMonthlyTotalCents = (entries: SavingsPlanEntryValues[], month: string) => entries.reduce((total, entry) => {
  if (entry.startMonth && month < entry.startMonth) return total;
  if (entry.endMonth && month > entry.endMonth) return total;
  return total + (amountToCents(entry.amount) ?? 0);
}, 0);

export const buildSavingsProjection = (
  start: string,
  end: string,
  incomes: SavingsPlanEntryValues[],
  expenses: SavingsPlanEntryValues[],
  defaultAccountId: string | null = null,
) => {
  const count = getPlanMonthCount(start, end);
  const first = monthIndex(start);
  if (first === null || count === 0 || count > MAX_PLAN_MONTHS) return [];
  if ([...incomes, ...expenses].some(entry => amountToCents(entry.amount) === null || !isValidEntryPeriod(entry))) return [];

  let accumulatedCents = 0;
  const accountBalances: Record<string, number> = {};
  // Work in integer cents so repeated monthly additions do not accumulate float errors.
  return Array.from({length: count}, (_, index) => {
    const month = first + index;
    const monthValue = `${Math.floor(month / 12)}-${String(month % 12 + 1).padStart(2, '0')}`;
    const incomeCents = getMonthlyTotalCents(incomes, monthValue);
    const expenseCents = getMonthlyTotalCents(expenses, monthValue);
    const remainingCents = incomeCents - expenseCents;
    accumulatedCents += remainingCents;
    for (const [entries, sign] of [[incomes, 1], [expenses, -1]] as const) {
      for (const entry of entries) {
        if (entry.startMonth && monthValue < entry.startMonth || entry.endMonth && monthValue > entry.endMonth) continue;
        const accountId = entry.accountId ?? defaultAccountId ?? UNASSIGNED_ACCOUNT;
        accountBalances[accountId] = (accountBalances[accountId] ?? 0) + sign * (amountToCents(entry.amount) ?? 0);
      }
    }
    return {
      month: monthValue,
      incomeCents,
      expenseCents,
      remainingCents,
      accumulatedCents,
      accountBalances: {...accountBalances},
    };
  });
};

type ProjectionMonth = ReturnType<typeof buildSavingsProjection>[number];

export const groupSavingsProjectionByYear = (rows: ProjectionMonth[]) => {
  const years = new Map<string, {
    year: string;
    months: ProjectionMonth[];
    incomeCents: number;
    expenseCents: number;
    remainingCents: number;
    accumulatedCents: number;
    accountBalances: Record<string, number>;
  }>();

  for (const row of rows) {
    const year = row.month.slice(0, 4);
    let group = years.get(year);
    if (!group) {
      group = {year, months: [], incomeCents: 0, expenseCents: 0, remainingCents: 0, accumulatedCents: 0, accountBalances: {}};
      years.set(year, group);
    }
    group.months.push(row);
    group.incomeCents += row.incomeCents;
    group.expenseCents += row.expenseCents;
    group.remainingCents += row.remainingCents;
    // Savings are a running balance, not a sum of monthly balances.
    group.accumulatedCents = row.accumulatedCents;
    group.accountBalances = {...row.accountBalances};
  }

  return [...years.values()];
};
