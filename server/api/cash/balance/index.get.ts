import { defineEventHandler, createError, getCookie } from 'h3';
import { CashDepositModel } from '~/server/models/CashDepositModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  const deposits = await CashDepositModel.find({ userId }).sort({ date: -1 });

  if (!deposits) {
    throw createError({
      statusCode: 404,
      message: 'No cash deposits found.',
    });
  }

  return { status: 200, deposits };
});
