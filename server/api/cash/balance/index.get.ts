import {defineEventHandler, readBody, createError, getCookie} from 'h3';
import {CashBalanceModel} from "~/server/models/CashBalanceModel";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  let cashBalance = await CashBalanceModel.findOne({userId});

  if (!cashBalance) {
    throw createError({
      statusCode: 404,
      message: 'No cash balance found.',
    });
  }

  return {status: 200, cashBalance: cashBalance};
});
