import {createError, getCookie, defineEventHandler} from 'h3';
import {CategoryModel} from '~/server/models/CategoryModel';

export default defineEventHandler(async (event) => {
  try {
    const userId = getCookie(event, 'userId');
    if (!userId) {
      throw createError({statusCode: 401, message: 'Unauthorized'});
    }

    const categories = await CategoryModel.find();
    return {status: 200, message: 'Expense categories retrieved successfully', categories};
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An unexpected error occurred',
    });
  }
});
