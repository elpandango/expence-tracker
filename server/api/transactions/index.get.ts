import {defineEventHandler, getQuery, getCookie, createError} from 'h3';
import {TransactionModel} from '~/server/models/TransactionModel';
import mongoose from "mongoose";

const buildUtcDayRange = (dateKey: string) => {
  const start = new Date(`${dateKey}T00:00:00.000Z`);
  const end = new Date(`${dateKey}T23:59:59.999Z`);

  return {
    date: {
      $gte: start,
      $lte: end,
    },
  };
};

type TransactionQuery = {
  userId: mongoose.Types.ObjectId;
  type?: string | string[];
  accountId?: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  relatedAccountId?: mongoose.Types.ObjectId;
  date?: {
    $gte: Date;
    $lte: Date;
  };
  amount?: {
    $gte?: number;
    $lte?: number;
  };
  description?: {
    $regex: string | string[];
    $options: string;
  };
};

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const {
    type,
    accountId,
    categoryId,
    relatedAccountId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    description,
    page = 1,
    perPage,
    limit,
  } = getQuery(event);

  const currentPage = Math.max(Number(page) || 1, 1);
  const itemsPerPage = Math.max(Number(perPage || limit || 5), 1);
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const query: TransactionQuery = {userId: userObjectId};

  if (type) {
    query.type = type;
  }

  if (accountId) {
    query.accountId = new mongoose.Types.ObjectId(accountId);
  }

  if (categoryId) {
    query.category = new mongoose.Types.ObjectId(categoryId);
  }

  if (relatedAccountId) {
    query.relatedAccountId = new mongoose.Types.ObjectId(relatedAccountId);
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

  const dateGroupsResult = await TransactionModel.aggregate([
    {$match: query},
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date',
            timezone: 'UTC',
          },
        },
        maxDate: {$max: '$date'},
      },
    },
    {$sort: {maxDate: -1}},
    {
      $facet: {
        paginated: [
          {$skip: (currentPage - 1) * itemsPerPage},
          {$limit: itemsPerPage},
        ],
        total: [
          {$count: 'count'},
        ],
      },
    },
  ]);

  const paginatedDates = dateGroupsResult[0]?.paginated ?? [];
  const totalItems = dateGroupsResult[0]?.total?.[0]?.count ?? 0;
  const dateKeys = paginatedDates.map(({_id}) => _id);

  if (!dateKeys.length) {
    return {
      status: 200,
      transactions: [],
      totalItems,
      currentPage,
      hasNextPage: itemsPerPage * currentPage < totalItems,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalItems / itemsPerPage),
    };
  }

  const pageQuery = {
    $and: [
      query,
      {
        $or: dateKeys.map(buildUtcDayRange),
      },
    ],
  };

  const transactions = await TransactionModel.find(pageQuery)
    .populate('accountId', 'name type currency')
    .populate('relatedAccountId', 'name type currency')
    .populate('category', 'name icon color')
    .sort({date: -1})
    .lean();

  const groupedTransactions = transactions.reduce<Record<string, typeof transactions>>((acc, transaction) => {
    const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
    if (!acc[transactionDate]) {
      acc[transactionDate] = [];
    }
    acc[transactionDate].push(transaction);
    return acc;
  }, {});

  const groupedArray = dateKeys
    .map((date) => ({
      date,
      transactions: (groupedTransactions[date] || []).sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
    .filter(({transactions}) => transactions.length > 0);

  return {
    status: 200,
    transactions: groupedArray,
    totalItems,
    currentPage,
    hasNextPage: itemsPerPage * currentPage < totalItems,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage + 1,
    previousPage: currentPage - 1,
    lastPage: Math.ceil(totalItems / itemsPerPage),
  };
});
