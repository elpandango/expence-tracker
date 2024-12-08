import '~/server/models';
import { defineEventHandler, getQuery, getCookie, createError } from 'h3';
import {getUserExpenses} from "~/server/controllers/expensesController/expensesController";
import { UserModel } from '~/server/models/UserModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Not authenticated' });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  const query = getQuery(event);
  const filters: { cardId?: string; uncategorized?: boolean } = {};

  if (query.cardId) {
    filters.cardId = query.cardId.toString();
  }

  if (query.uncategorized === 'true') {
    filters.uncategorized = true;
  }

  const expenses = await getUserExpenses(userId, filters);

  return {
    status: 200,
    message: 'Expenses retrieved successfully',
    expenses,
  };
});
