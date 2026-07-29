import {deleteAvatar} from '~/server/controllers/userController/userController';
import {getCookie} from "h3";
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  try {
    const updatedUser = await deleteAvatar(userId);

    await Promise.all([
      redis.del(`avatar:${userId}`),
      redis.del(`user:${userId}`),
    ]);

    return {
      avatar: '',
      avatarVersion: updatedUser.avatarVersion || 0,
    };
  } catch (err) {
    console.log(err);
    throw createError({ statusCode: 400, message: 'Failed to delete avatar.' });
  }
});
