import {createError, getCookie, defineEventHandler, getQuery} from 'h3';
import {CategoryModel} from '~/server/models/CategoryModel';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  try {
    const userId = getCookie(event, 'userId');
    if (!userId) {
      throw createError({statusCode: 401, message: 'Unauthorized'});
    }

    const {includeArchived} = getQuery(event);
    const shouldIncludeArchived = includeArchived === 'true';
    const cacheKey = shouldIncludeArchived
      ? `categories:${userId}:all`
      : `categories:${userId}:active`;

    //Redis usage
    const cachedCategories = await redis.get(cacheKey);

    if (cachedCategories) {
      return {
        status: 200,
        message: 'Expense categories retrieved successfully',
        categories: JSON.parse(cachedCategories),
      };
    }

    const categories = await CategoryModel.find(
      shouldIncludeArchived ? {} : {archived: false}
    );
    await redis.set(cacheKey, JSON.stringify(categories), 'EX', 600);
    return {status: 200, message: 'Expense categories retrieved successfully', categories};
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An unexpected error occurred',
    });
  }
});
