import {createError, getCookie, defineEventHandler} from 'h3';
import {CategoryModel} from '~/server/models/CategoryModel';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  try {
    const userId = getCookie(event, 'userId');
    if (!userId) {
      throw createError({statusCode: 401, message: 'Unauthorized'});
    }

    //Redis usage
    const cachedCategories = await redis.get(`categories:${userId}`);

    if (cachedCategories) {
      return {
        status: 200,
        message: 'Expense categories retrieved successfully',
        categories: JSON.parse(cachedCategories),
      };
    }

    const categories = await CategoryModel.find();
    await redis.set(`categories:${userId}`, JSON.stringify(categories), 'EX', 600);
    return {status: 200, message: 'Expense categories retrieved successfully', categories};
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An unexpected error occurred',
    });
  }
});
