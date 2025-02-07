import {defineEventHandler, getQuery, getCookie, createError} from 'h3';
import {TransactionModel} from '~/server/models/TransactionModel';
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const {
    type,
    accountId,
    relatedAccountId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    description,
    page = 1,
    perPage = 5
  } = getQuery(event);

  const query = {userId};

  if (type) {
    query.type = type;
  }

  if (accountId) {
    query.accountId = new mongoose.Types.ObjectId(accountId);
  }

  if (relatedAccountId) {
    query.relatedAccountId = relatedAccountId;
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    query.date = {$gte: start, $lte: end};
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = parseFloat(minAmount);
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
  }

  if (description) {
    query.description = {$regex: description, $options: 'i'};
  }

  const transactions = await TransactionModel.find(query)
    .populate('accountId', 'name type currency')
    .populate('relatedAccountId', 'name type currency')
    .populate('category', 'name icon color')
    .sort({date: -1})
    .lean();

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
    if (!acc[transactionDate]) {
      acc[transactionDate] = [];
    }
    acc[transactionDate].push(transaction);
    return acc;
  }, {});

  const groupedArray = Object.entries(groupedTransactions)
    .map(([date, transactions]) => ({
      date,
      transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalItems = groupedArray.length;
  const paginatedResult = groupedArray.slice((+page - 1) * perPage, +page * perPage);

  return {
    status: 200,
    transactions: paginatedResult,
    totalItems,
    currentPage: parseInt(page),
    hasNextPage: perPage * +page < totalItems,
    hasPrevPage: +page > 1,
    nextPage: +page + 1,
    previousPage: +page - 1,
    lastPage: Math.ceil(totalItems / perPage),
  };
});
