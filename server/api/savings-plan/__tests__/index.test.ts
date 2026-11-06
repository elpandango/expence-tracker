import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getCookie, readBody} from 'h3';
import type {H3Event} from 'h3';
import getPlan from '../index.get';
import putPlan from '../index.put';
import {SavingsPlanModel} from '~/server/models/SavingsPlanModel';
import {AccountModel} from '~/server/models/AccountModel';
import {verifyToken} from '~/server/utils/auth';
import {validateSavingsPlan} from '~/server/utils/savingsPlan';

vi.mock('~/server/models/SavingsPlanModel', () => ({SavingsPlanModel: {findOne: vi.fn(), findOneAndUpdate: vi.fn()}}));
vi.mock('~/server/models/AccountModel', () => ({AccountModel: {find: vi.fn()}}));
vi.mock('~/server/utils/auth', () => ({verifyToken: vi.fn()}));
vi.mock('h3', async (importOriginal) => ({
  ...await importOriginal<typeof import('h3')>(), getCookie: vi.fn(), readBody: vi.fn(),
}));

const userId = '67745325944561b4ab55f52b';
const event = {} as H3Event;
const payload = () => ({
  startMonth: '2026-11', endMonth: '2031-10',
  incomes: [{id: 1, name: ' Salary ', amountCents: 300001, startMonth: null, endMonth: '2027-12'}],
  expenses: [{id: 2, name: 'Rent', amountCents: 100000, startMonth: null, endMonth: null}],
});
let lean: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCookie).mockReturnValue('signed-token');
  vi.mocked(verifyToken).mockReturnValue({userId});
  vi.mocked(readBody).mockResolvedValue(payload());
  lean = vi.fn().mockResolvedValue(null);
  const query = {select: vi.fn().mockReturnThis(), lean};
  vi.mocked(SavingsPlanModel.findOne).mockReturnValue(query);
  vi.mocked(SavingsPlanModel.findOneAndUpdate).mockReturnValue(query);
  vi.mocked(AccountModel.find).mockReturnValue({select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([])});
});

describe('savings plan API', () => {
  it('requires a signed token before reading or writing data', async () => {
    vi.mocked(getCookie).mockReturnValue(undefined);
    await expect(getPlan(event)).rejects.toMatchObject({statusCode: 401});
    await expect(putPlan(event)).rejects.toMatchObject({statusCode: 401});
    expect(SavingsPlanModel.findOne).not.toHaveBeenCalled();
    expect(SavingsPlanModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(readBody).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens and malformed user identities', async () => {
    for (const decoded of [null, 'invalid', {userId: 'not-an-object-id'}]) {
      vi.mocked(verifyToken).mockReturnValue(decoded);
      await expect(getPlan(event)).rejects.toMatchObject({statusCode: 401});
    }
    expect(SavingsPlanModel.findOne).not.toHaveBeenCalled();
  });

  it('returns null for a new login and reads only the authenticated user plan', async () => {
    expect(await getPlan(event)).toEqual({plan: null, accounts: []});
    expect(SavingsPlanModel.findOne).toHaveBeenCalledWith({_id: userId, userId});
    const plan = {...payload(), updatedAt: new Date()};
    lean.mockResolvedValue(plan);
    expect(await getPlan(event)).toEqual({plan, accounts: []});
    expect(AccountModel.find).toHaveBeenCalledWith({userId});
  });

  it('upserts a single personal document and ignores forged owner and extra fields', async () => {
    vi.mocked(readBody).mockResolvedValue({...payload(), userId: 'attacker', _id: 'forged', balance: 999});
    await putPlan(event);
    expect(SavingsPlanModel.findOneAndUpdate).toHaveBeenCalledWith(
      {_id: userId, userId},
      {$set: {...payload(), defaultAccountId: null, incomes: [{...payload().incomes[0], name: 'Salary', accountId: null}], expenses: [{...payload().expenses[0], accountId: null}]}, $setOnInsert: {userId}},
      {upsert: true, new: true, runValidators: true},
    );
    expect(getCookie).toHaveBeenCalledWith(event, 'auth_token');
  });

  it('rejects an invalid payload before any write', async () => {
    vi.mocked(readBody).mockResolvedValue({...payload(), endMonth: '2025-01'});
    await expect(putPlan(event)).rejects.toMatchObject({statusCode: 400});
    expect(SavingsPlanModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('checks account ownership and EUR currency before saving', async () => {
    const accountId = '6774569ceeffff409e18df4b';
    vi.mocked(readBody).mockResolvedValue({...payload(), defaultAccountId: accountId});
    await expect(putPlan(event)).rejects.toMatchObject({statusCode: 400});
    expect(SavingsPlanModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(AccountModel.find).toHaveBeenCalledWith({_id: {$in: [accountId]}, userId, currency: 'EUR'});
    vi.mocked(AccountModel.find).mockReturnValue({select: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([{_id: accountId}])});
    await putPlan(event);
    expect(SavingsPlanModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it('validates separately assigned entry accounts, not just the main account', async () => {
    const accountId = '6774569ceeffff409e18df4b';
    vi.mocked(readBody).mockResolvedValue({...payload(), incomes: [{...payload().incomes[0], accountId}]});
    await expect(putPlan(event)).rejects.toMatchObject({statusCode: 400});
    expect(SavingsPlanModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe('savings plan validation', () => {
  it('keeps cent precision and nullable boundaries', () => {
    const result = validateSavingsPlan(payload());
    expect(result.incomes[0]).toMatchObject({name: 'Salary', amountCents: 300001, startMonth: null});
  });

  it('accepts old plans without account fields and rejects malformed account references', () => {
    const legacy = validateSavingsPlan(payload());
    expect(legacy.defaultAccountId).toBeNull();
    expect(legacy.incomes[0].accountId).toBeNull();
    expect(() => validateSavingsPlan({...payload(), defaultAccountId: 'bad'})).toThrow();
    expect(() => validateSavingsPlan({...payload(), incomes: [{...payload().incomes[0], accountId: {$ne: null}}]})).toThrow();
  });

  it('rejects malformed periods, amounts, identities, duplicate ids and oversized lists', () => {
    const invalidEntries = [
      {amountCents: -1}, {amountCents: 1.5}, {amountCents: '100'}, {amountCents: Infinity},
      {name: ''}, {name: 'x'.repeat(101)}, {id: -1}, {id: 1.5},
      {startMonth: '2027-13'}, {startMonth: '2028-01', endMonth: '2027-01'}, {endMonth: undefined},
    ];
    for (const invalid of invalidEntries) {
      expect(() => validateSavingsPlan({...payload(), incomes: [{...payload().incomes[0], ...invalid}]})).toThrow();
    }
    expect(() => validateSavingsPlan({...payload(), expenses: payload().incomes})).toThrow();
    expect(() => validateSavingsPlan({...payload(), incomes: Array(501).fill(payload().incomes[0])})).toThrow();
    expect(() => validateSavingsPlan({...payload(), endMonth: '2126-11'})).toThrow();
    expect(() => validateSavingsPlan(null)).toThrow();
  });
});
