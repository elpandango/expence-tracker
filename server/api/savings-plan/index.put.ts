import {createError, defineEventHandler, readBody} from 'h3';
import {SavingsPlanModel} from '~/server/models/SavingsPlanModel';
import {AccountModel} from '~/server/models/AccountModel';
import {requireSavingsPlanUser, validateSavingsPlan} from '~/server/utils/savingsPlan';

export default defineEventHandler(async (event) => {
  const userId = requireSavingsPlanUser(event);
  const payload = validateSavingsPlan(await readBody(event));
  const accountIds = [...new Set([payload.defaultAccountId, ...payload.incomes.map(entry => entry.accountId), ...payload.expenses.map(entry => entry.accountId)]
    .filter((id): id is string => !!id))];
  if (accountIds.length) {
    const accounts = await AccountModel.find({_id: {$in: accountIds}, userId, currency: 'EUR'}).select('_id').lean();
    if (accounts.length !== accountIds.length) {
      throw createError({statusCode: 400, message: 'Selected accounts are unavailable or not in EUR'});
    }
  }
  const plan = await SavingsPlanModel.findOneAndUpdate(
    {_id: userId, userId},
    {$set: payload, $setOnInsert: {userId}},
    {upsert: true, new: true, runValidators: true},
  ).select('defaultAccountId startMonth endMonth incomes expenses updatedAt -_id').lean();
  return {plan};
});
