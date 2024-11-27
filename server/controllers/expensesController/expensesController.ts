import { ExpenseModel } from '~/server/models/ExpenseModel';

/**
 * Getting all user expenses with filtering.
 * @param userId - ID of a user
 * @param filters - Filters (cardId or "uncategorized")
 */
export const getUserExpenses = async (userId: string, filters: { cardId?: string; uncategorized?: boolean }) => {
  const query: any = { userId };

  if (filters.cardId) {
    query.cardId = filters.cardId;
  }

  if (filters.uncategorized) {
    query.cardId = { $in: [null, undefined] };
  }

  return await ExpenseModel.find(query).sort({ date: -1 });
};
