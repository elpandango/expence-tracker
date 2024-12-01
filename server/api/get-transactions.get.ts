import {defineEventHandler, getQuery, getCookie, createError} from 'h3';
import {CashDepositModel} from '~/server/models/CashDepositModel';
import {ExpenseModel} from '~/server/models/ExpenseModel';
import {CardDepositModel} from '~/server/models/CardDepositModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const {
    type,
    source,
    cardId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    description,
    page = 1,
    perPage = 10
  } = getQuery(event);

  const expenses = await ExpenseModel.find({userId})
    .populate('category', 'name icon color')
    .lean();

  const cashDeposits = await CashDepositModel.find({userId}).lean();

  const cardDeposits = await CardDepositModel.find({userId})
    .populate('cardId', 'name number')
    .lean();

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
    number: expense.number,
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

  const mappedCardTransactions = cardDeposits.map((deposit) => ({
    id: deposit._id,
    type: 'deposit',
    amount: deposit.amount,
    date: deposit.date || deposit.createdAt || new Date(),
    category: `Card - ${deposit.cardId?.name || 'Unnamed Card'}`,
    sourceCategory: 'Card Deposit',
    description: deposit.description || 'Card deposit',
    source: 'card',
    cardId: deposit.cardId?._id,
    number: deposit.cardId?.number,
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
    allTransactions = allTransactions.filter(transaction => transaction.cardId?.toString() === cardId);
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    allTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }

  if (minAmount || maxAmount) {
    const min = minAmount ? parseFloat(minAmount) : Number.MIN_SAFE_INTEGER;
    const max = maxAmount ? parseFloat(maxAmount) : Number.MAX_SAFE_INTEGER;

    allTransactions = allTransactions.filter(transaction => {
      return transaction.amount >= min && transaction.amount <= max;
    });
  }

  if (description) {
    const lowerCaseDescription = description.toLowerCase();
    allTransactions = allTransactions.filter(transaction =>
      transaction.description?.toLowerCase().includes(lowerCaseDescription)
    );
  }

  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalItems = allTransactions.length;
  allTransactions = allTransactions.slice((+page - 1) * perPage, +page * perPage);

  return {
    status: 200,
    transactions: allTransactions,
    totalItems: totalItems,
    currentPage: parseInt(page),
    hasNextPage: perPage * +page < totalItems,
    hasPrevPage: +page > 1,
    nextPage: +page + 1,
    previousPage: +page - 1,
    lastPage: Math.ceil(totalItems / perPage),
  };
});
