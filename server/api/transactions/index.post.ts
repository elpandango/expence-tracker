import {createError, defineEventHandler, getCookie, readBody} from "h3";
import {createTransaction} from "~/server/controllers/transactionsController/createTransaction";

export default defineEventHandler(async (event) => {
  const transactionData = await readBody(event);

  try {
    const userId = getCookie(event, 'userId');
    if (!userId) {
      throw createError({statusCode: 401, message: 'Unauthorized'});
    }
    const savedTransaction = await createTransaction(transactionData, userId);
    return {
      status: 201,
      message: "Transaction created successfully.",
      transaction: savedTransaction,
    };
  } catch (err) {
    throw err;
  }
});
