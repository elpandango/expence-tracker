import {defineEventHandler, getQuery, getCookie, createError} from 'h3';
import {TransactionModel} from '~/server/models/TransactionModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const query = getQuery(event);
  const {type, top = 5, startDate, endDate, chartType} = query;

  const mongoQuery: any = {userId};

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    mongoQuery.date = {$gte: start, $lte: end};
  }

  if (type) {
    mongoQuery.type = type;
  }

  switch (chartType) {
    case 'allTransactions': {
      const transactions = await TransactionModel.find(mongoQuery)
        .sort({date: 1})
        .lean();

      const series = transactions.reduce(
        (acc, transaction) => {
          const key = transaction.date.toISOString().split('T')[0];
          acc[transaction.type === 'income' ? 'income' : 'expense'][key] =
            (acc[transaction.type === 'income' ? 'income' : 'expense'][key] || 0) +
            transaction.amount;
          return acc;
        },
        {income: {}, expense: {}},
      );

      return {
        status: 200,
        data: {
          income: Object.entries(series.income).map(([date, amount]) => ({date, amount})),
          expense: Object.entries(series.expense).map(([date, amount]) => ({date, amount})),
        },
      };
    }

    case 'topCategories': {
      const transactions = await TransactionModel.find({...mongoQuery, type: 'expense'})
        .populate('category', 'name')
        .lean();

      const categoryTotals = transactions.reduce((acc, transaction) => {
        const categoryName = transaction.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {});

      const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, top);

      return {
        status: 200,
        data: sortedCategories.map(([category, amount]) => ({category, amount})),
      };
    }

    case 'allCategories': {
      const transactions = await TransactionModel.find({...mongoQuery, type: 'expense'})
        .populate('category', 'name')
        .lean();

      const categoryTotals = transactions.reduce((acc, transaction) => {
        const categoryName = transaction.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {});

      return {
        status: 200,
        data: Object.entries(categoryTotals).map(([category, amount]) => ({category, amount})),
      };
    }

    case 'cashAndCards': {
      const transactions = await TransactionModel.find({...mongoQuery, type: 'expense'})
        .populate('accountId', 'type')
        .sort({date: 1})
        .lean();

      const series = transactions.reduce(
        (acc, transaction) => {
          const key = transaction.date.toISOString().split('T')[0];
          const accountType = transaction.accountId?.type === 'card' ? 'card' : 'cash';
          acc[accountType][key] = (acc[accountType][key] || 0) + Math.abs(transaction.amount);
          return acc;
        },
        {card: {}, cash: {}},
      );

      return {
        status: 200,
        data: {
          card: Object.entries(series.card).map(([date, amount]) => ({date, amount})),
          cash: Object.entries(series.cash).map(([date, amount]) => ({date, amount})),
        },
      };
    }

    default:
      return {
        status: 400,
        message: 'Invalid chart type',
      };
  }
});
