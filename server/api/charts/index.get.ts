import {defineEventHandler, getQuery, getCookie, createError} from 'h3';
import {getTransactions} from "~/server/controllers/transactionsController/transactionsController";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const query = getQuery(event);

  const transactions = await getTransactions(userId, query);

  return {
    status: 200,
    transactions,
  };
});
