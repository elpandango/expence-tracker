import {defineEventHandler, readBody, createError, getCookie} from 'h3';
import {CashBalanceModel} from "~/server/models/CashBalanceModel";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const {amount} = await readBody(event);

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Valid positive amount is required.',
    });
  }
  const numericAmount = Number(amount);

  let cashBalance = await CashBalanceModel.findOne({userId});

  if (!cashBalance) {
    cashBalance = new CashBalanceModel({
      userId,
      amount: numericAmount,
    });
  } else {
    cashBalance.amount += numericAmount;
  }

  await cashBalance.save();

  return {status: 200, newBalance: cashBalance.amount};
});
