import { defineEventHandler, getCookie } from 'h3';
import { CategoryModel } from '~/server/models/CategoryModel';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;

  if (!id) {
    throw createError({ statusCode: 400, message: 'Category ID is required' });
  }

  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const deletedCategory = await CategoryModel.findOneAndDelete({ _id: id, userId });

  if (!deletedCategory) {
    throw createError({ statusCode: 404, message: 'Category not found' });
  }

  await Promise.all([
    redis.del(`categories:${userId}:active`),
    redis.del(`categories:${userId}:all`),
  ]);
  return { status: 200, message: 'Category deleted successfully' };
});
