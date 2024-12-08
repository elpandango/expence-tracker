import '~/server/models';

import {CashDepositModel} from '~/server/models/CashDepositModel';
import {ExpenseModel} from '~/server/models/ExpenseModel';
import {CardDepositModel} from '~/server/models/CardDepositModel';
import {groupTransactions} from "~/utils/groupTransactions";

export const getTransactions = async (userId, query) => {
  const {source, groupBy, type, cardId, top, startDate, endDate} = query;

  let transactions = [];

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.setFullYear(now.getFullYear() - 1));
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  if (source === 'card' || !source) {
    const cardDeposits = await CardDepositModel.find({userId, date: {$gte: start, $lte: end}})
      .populate('cardId', 'name number')
      .lean();

    const mappedCardTransactions = cardDeposits.map((deposit) => ({
      type: 'deposit',
      amount: deposit.amount,
      date: deposit.date || deposit.createdAt || new Date(),
      category: `Card - ${deposit.cardId?.name || 'Unnamed Card'}`,
      source: 'card',
      cardId: deposit.cardId?._id,
    }));
    transactions = [...transactions, ...mappedCardTransactions];
  }

  if (source === 'cash' || !source) {
    const cashDeposits = await CashDepositModel.find({userId, createdAt: {$gte: start, $lte: end}}).lean();

    const mappedCashTransactions = cashDeposits.map((cash) => ({
      type: 'deposit',
      amount: cash.amount,
      date: cash.createdAt || new Date(),
      category: 'Cash',
      source: 'cash',
    }));
    transactions = [...transactions, ...mappedCashTransactions];
  }

  const expenses = await ExpenseModel.find({userId, date: {$gte: start, $lte: end}})
    .populate('category', 'name icon color')
    .lean();

  const mappedExpenses = expenses.map((expense) => ({
    type: 'expense',
    amount: -expense.amount,
    date: expense.date,
    category: expense.category?.name || 'Uncategorized',
    source: expense.cardId ? 'card' : 'cash',
    cardId: expense.cardId?._id,
  }));

  transactions = [...transactions, ...mappedExpenses];

  if (type) {
    transactions = transactions.filter((transaction) => transaction.type === type);
  }

  if (source) {
    transactions = transactions.filter((transaction) => transaction.source === source);
  }

  if (cardId) {
    transactions = transactions.filter((transaction) => transaction.cardId?.toString() === cardId);
  }

  if (groupBy) {
    transactions = groupTransactions(transactions, groupBy, top);
  }

  return transactions;
};
