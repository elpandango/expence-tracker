import { CategoryModel } from '~/server/models/CategoryModel';
import {createError, getCookie, defineEventHandler, readBody} from "h3";
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const body = await readBody(event);

  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    throw createError({ statusCode: 400, message: 'Category name is required and must be a string' });
  }

  const updatedCategory = await CategoryModel.findByIdAndUpdate(id, {
    name: body.name,
    icon: body.icon ?? '',
    archived: typeof body.archived === 'boolean' ? body.archived : undefined,
  }, { new: true });

  if (!updatedCategory) {
    throw createError({ statusCode: 404, message: 'Category not found' });
  }

  await Promise.all([
    redis.del(`categories:${userId}:active`),
    redis.del(`categories:${userId}:all`),
  ]);
  return { status: 200, message: 'Category updated successfully', category: updatedCategory };
});
