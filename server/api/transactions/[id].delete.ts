import {deleteTransaction} from "~/server/controllers/transactionsController/deleteTransaction";

export default defineEventHandler(async (event) => {
  const {id} = event.context.params;

  try {
    await deleteTransaction(id);
    return {
      status: 200,
      message: "Transaction deleted successfully",
    };
  } catch (err) {
    console.error("Error during delete process: ", err);
    throw err;
  }
});
