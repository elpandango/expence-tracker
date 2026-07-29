import {defineEventHandler, getQuery, getCookie, createError} from 'h3';
import mongoose from 'mongoose';
import {TransactionModel} from '~/server/models/TransactionModel';
import {CategoryModel} from '~/server/models/CategoryModel';

const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const query = getQuery(event);
  const {type, startDate, endDate, chartType} = query;
// eslint-disable-next-line
  const mongoQuery: any = {userId: new mongoose.Types.ObjectId(userId)};

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    mongoQuery.date = {$gte: start, $lte: end};
  }

  if (type) {
    mongoQuery.type = type;
  }

  switch (chartType) {
    case 'categoryTotals': {
      const totals = await TransactionModel.aggregate([
        {$match: {...mongoQuery, type: 'expense'}},
        {
          $group: {
            _id: '$category',
            amount: {
              $sum: {$abs: '$amount'},
            },
          },
        },
        {$sort: {amount: -1}},
      ]);

      const categoryIds = totals
        .map(({_id}) => _id)
        .filter(Boolean);

      const categories = categoryIds.length > 0
        ? await CategoryModel.find({_id: {$in: categoryIds}}, 'name').lean()
        : [];

      const categoryNameMap = new Map(
        categories.map((category) => [category._id.toString(), category.name])
      );

      return {
        status: 200,
        data: totals.map((item) => ({
          category: item._id ? categoryNameMap.get(item._id.toString()) || 'Uncategorized' : 'Uncategorized',
          categoryId: item._id?.toString() || null,
          amount: roundAmount(item.amount),
        })),
      };
    }

    default:
      return {
        status: 400,
        message: 'Invalid chart type',
      };
  }
});
