import {defineEventHandler, getCookie, readBody} from "h3";
import {createTransaction} from "~/server/controllers/transactionController";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, "userId");
  const transactionData = await readBody(event);

  try {
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
