import { defineEventHandler, createError, getCookie } from 'h3';
import { CashBalanceModel } from '~/server/models/CashBalanceModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'User not authenticated.',
    });
  }

  const cashBalance = await CashBalanceModel.findOne({ userId, currency: 'USD' });

  if (!cashBalance) {
    throw createError({
      statusCode: 404,
      message: 'Cash balance not found.',
    });
  }

  return { status: 200, balance: cashBalance.amount };
});
