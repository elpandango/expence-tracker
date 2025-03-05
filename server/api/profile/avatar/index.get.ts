import {defineEventHandler, createError} from 'h3';
import {UserModel} from '~/server/models/UserModel';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  //Redis usage
  // const cachedAvatar = await redis.get(`avatar:${userId}`);
  //
  // if (cachedAvatar) {
  //   return {
  //     avatar: JSON.parse(cachedAvatar)
  //   }
  // }

  const avatar = await UserModel.findById(userId, 'avatar');

  if (!avatar) {
    throw createError({statusCode: 404, message: 'Avatar not found'});
  }

  // await redis.set(`avatar:${userId}`, JSON.stringify(avatar), 'EX', 600);

  return {
    avatar: avatar,
  };
});
