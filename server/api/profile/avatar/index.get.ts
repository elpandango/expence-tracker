import { defineEventHandler, createError } from 'h3';
import { UserModel } from '~/server/models/UserModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const avatar = await UserModel.findById(userId, 'avatar');

  if (!avatar) {
    throw createError({ statusCode: 404, message: 'Avatar not found' });
  }

  return {
    avatar: avatar,
  };
});
