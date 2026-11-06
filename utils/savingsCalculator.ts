import {amountToCents} from './savingsPlan';

export const CALCULATOR_MAX_MONTHS = 1200;

export const calculateSavings = (
  initialAmount: string | number,
  monthlyAmount: string | number,
  months: string | number,
  now = new Date(),
) => {
  if (!String(initialAmount).trim() || !String(monthlyAmount).trim() || !/^\d+$/.test(String(months).trim())) return null;
  const initialCents = amountToCents(initialAmount);
  const monthlyCents = amountToCents(monthlyAmount);
  const count = Number(months);
  if (initialCents === null || monthlyCents === null || !Number.isInteger(count) || count < 1 || count > CALCULATOR_MAX_MONTHS) return null;
  const targetDate = new Date(now.getFullYear(), now.getMonth() + count, 1);
  const addedCents = monthlyCents * count;
  return {
    initialCents, addedCents, totalCents: initialCents + addedCents,
    targetMonth: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
  };
};
