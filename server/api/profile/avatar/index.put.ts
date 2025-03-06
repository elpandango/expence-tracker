import {updateAvatar} from '~/server/controllers/userController/userController';
import {getCookie, readBody} from 'h3';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const { avatar } = await readBody(event);

  try {
    await redis.set(`avatar:${userId}`, JSON.stringify(avatar), 'EX', 600);
    return await updateAvatar(userId, avatar);
  } catch (err) {
    console.log(err);
    throw createError({ statusCode: 400, message: 'Failed to update avatar.' });
  }
});
