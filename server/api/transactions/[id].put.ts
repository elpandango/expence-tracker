import {getCookie} from "h3";
import {updateTransaction} from "~/server/controllers/transactionsController/updateTransaction";

export default defineEventHandler(async (event) => {
  const {id} = event.context.params;
  const userId = getCookie(event, "userId");
  const updatedTransaction = await readBody(event);

  try {
    const newTransaction = await updateTransaction(updatedTransaction, id, userId);

    if (newTransaction) {
      return {
        status: 200,
        message: "Transaction updated successfully",
        transaction: newTransaction,
      }
    } else {
      return {
        status: 400,
        message: "No changes detected",
      };
    }
  } catch (err) {
    throw err;
  }
});