import { defineEventHandler, getCookie } from 'h3';
import { AccountModel } from '~/server/models/AccountModel';
import { TransactionModel } from '~/server/models/TransactionModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const { id } = event.context.params;

  if (!id) {
    throw createError({ statusCode: 400, message: 'Account ID is required' });
  }

  const account = await AccountModel.findOne({ _id: id, userId });
  if (!account) {
    throw createError({ statusCode: 404, message: 'Account not found' });
  }

  const transactions = await TransactionModel.find({ accountId: id });

  if (transactions.length > 0) {
    await TransactionModel.deleteMany({ accountId: id });
  }

  await AccountModel.deleteOne({ _id: id });

  return {
    status: 200,
    message: 'Account and associated transactions deleted successfully',
  };
});
