import { defineEventHandler, getQuery, getCookie, createError } from 'h3';
import { CashDepositModel } from "~/server/models/CashDepositModel";
import { ExpenseModel } from '~/server/models/ExpenseModel';
import { CardModel } from '~/server/models/CardModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Not authenticated' });
  }

  const { type, source, cardId, startDate, endDate } = getQuery(event);

  const expenses = await ExpenseModel.find({ userId })
    .populate('category', 'name icon color')
    .lean();

  const cashDeposits = await CashDepositModel.find({ userId }).lean();

  const cards = await CardModel.find({ userId }).lean();

  const mappedExpenses = expenses.map((expense) => ({
    id: expense._id,
    type: 'expense',
    amount: -expense.amount,
    date: expense.date,
    category: expense.category,
    sourceCategory: 'Expense',
    description: expense.description,
    source: expense.cardId ? 'card' : 'cash',
    cardId: expense.cardId,
  }));

  const mappedCashTransactions = cashDeposits.map((cash) => ({
    id: cash._id,
    type: 'deposit',
    amount: cash.amount,
    date: cash.createdAt || new Date(),
    category: 'Cash',
    sourceCategory: 'Cash Deposit',
    description: cash.description,
    source: 'cash',
  }));

  const mappedCardTransactions = cards.map((card) => ({
    id: card._id,
    type: 'deposit',
    amount: card.balance,
    cardId: card._id, // Используем cardId
    date: card.updatedAt || new Date(),
    category: `Card - ${card.name || 'Unnamed Card'}`,
    sourceCategory: 'Card Deposit',
    source: 'card',
  }));

  let allTransactions = [
    ...mappedExpenses,
    ...mappedCashTransactions,
    ...mappedCardTransactions,
  ];

  if (type) {
    allTransactions = allTransactions.filter(transaction => transaction.type === type);
  }

  if (source) {
    allTransactions = allTransactions.filter(transaction => transaction.source === source);
  }

  if (cardId) {
    allTransactions = allTransactions.filter(transaction => transaction.cardId.toString() === cardId); // Сравниваем cardId как строку
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    allTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }

  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    status: 200,
    transactions: allTransactions,
  };
});
