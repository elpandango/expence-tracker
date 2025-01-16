import {deleteTransaction} from "~/server/controllers/transactionController";

export default defineEventHandler(async (event) => {
  const {id} = event.context.params;

  try {
    await deleteTransaction(id);
    return {
      status: 200,
      message: "Transaction deleted successfully",
    };
  } catch (err) {
    throw err;
  }
});
