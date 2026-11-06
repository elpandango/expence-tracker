import {createError, getCookie} from 'h3';
import type {H3Event} from 'h3';
import {verifyToken} from '~/server/utils/auth';
import {getPlanMonthCount, isValidEntryPeriod, MAX_PLAN_MONTHS} from '~/utils/savingsPlan';
import type {SavedPlanEntry, SavingsPlanPayload} from '~/types/savingsPlan';

export const requireSavingsPlanUser = (event: H3Event): string => {
  const token = getCookie(event, 'auth_token');
  const decoded = token ? verifyToken(token) : null;
  if (!decoded || typeof decoded === 'string' || typeof decoded.userId !== 'string' || !/^[a-f\d]{24}$/i.test(decoded.userId)) {
    throw createError({statusCode: 401, message: 'Unauthorized'});
  }
  return decoded.userId;
};

const invalidPlan = (): never => {
  throw createError({statusCode: 400, message: 'Invalid savings plan'});
};
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const parseAccountId = (value: unknown): string | null => {
  if (value == null) return null;
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) return invalidPlan();
  return value.toLowerCase();
};

export const validateSavingsPlan = (body: unknown): SavingsPlanPayload => {
  if (!isRecord(body) || typeof body.startMonth !== 'string' || typeof body.endMonth !== 'string') return invalidPlan();
  const months = getPlanMonthCount(body.startMonth, body.endMonth);
  if (months === 0 || months > MAX_PLAN_MONTHS) return invalidPlan();
  const ids = new Set<number>();
  const parseEntries = (entries: unknown): SavedPlanEntry[] => {
    if (!Array.isArray(entries) || entries.length > 500) return invalidPlan();
    return entries.map((entry: unknown) => {
      if (!isRecord(entry)) return invalidPlan();
      const {id, name, amountCents, startMonth, endMonth} = entry;
      if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 0 || id >= Number.MAX_SAFE_INTEGER || ids.has(id)) return invalidPlan();
      ids.add(id);
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) return invalidPlan();
      if (typeof amountCents !== 'number' || !Number.isSafeInteger(amountCents) || amountCents < 0 || amountCents > 100_000_000_000) return invalidPlan();
      if (startMonth !== null && typeof startMonth !== 'string') return invalidPlan();
      if (endMonth !== null && typeof endMonth !== 'string') return invalidPlan();
      if (!isValidEntryPeriod({startMonth, endMonth})) return invalidPlan();
      return {id, name: name.trim(), amountCents, startMonth, endMonth, accountId: parseAccountId(entry.accountId)};
    });
  };
  return {startMonth: body.startMonth, endMonth: body.endMonth, defaultAccountId: parseAccountId(body.defaultAccountId), incomes: parseEntries(body.incomes), expenses: parseEntries(body.expenses)};
};
