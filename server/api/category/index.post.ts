import {defineEventHandler, readBody, createError, getCookie} from 'h3';
import {CategoryModel} from '~/server/models/CategoryModel';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.name || typeof body.name !== 'string') {
      throw createError({statusCode: 400, message: 'Category name is required and must be a string'});
    }

    const userId = getCookie(event, 'userId');
    if (!userId) {
      throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const newCategory = new CategoryModel({
      name: body.name.trim(),
      icon: body.icon?.trim() || ''
    });

    await newCategory.save();
    // await redis.del(`categories:${userId}`);

    return {
      status: 200,
      message: 'Category added successfully',
      category: {
        id: newCategory._id,
        name: newCategory.name,
        icon: newCategory.icon,
      }
    };
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'An unexpected error occurred',
    });
  }
});
