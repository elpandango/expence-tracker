import { ExpenseModel } from '~/server/models/ExpenseModel';

/**
 * Получение всех трат пользователя с фильтрацией.
 * @param userId - ID пользователя
 * @param filters - Фильтры (cardId или "uncategorized")
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
