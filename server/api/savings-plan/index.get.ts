import {defineEventHandler} from 'h3';
import {SavingsPlanModel} from '~/server/models/SavingsPlanModel';
import {AccountModel} from '~/server/models/AccountModel';
import {requireSavingsPlanUser} from '~/server/utils/savingsPlan';

export default defineEventHandler(async (event) => {
  const userId = requireSavingsPlanUser(event);
  const [plan, accounts] = await Promise.all([
    SavingsPlanModel.findOne({_id: userId, userId})
      .select('defaultAccountId startMonth endMonth incomes expenses updatedAt -_id').lean(),
    AccountModel.find({userId}).select('_id name currency').lean(),
  ]);
  return {plan, accounts: accounts.map(account => ({id: account._id.toString(), name: account.name, currency: account.currency}))};
});
