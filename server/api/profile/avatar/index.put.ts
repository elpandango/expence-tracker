import {updateAvatar} from '~/server/controllers/userController/userController';
import {getCookie, readBody} from 'h3';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const { avatar } = await readBody(event);

  try {
    const updatedUser = await updateAvatar(userId, avatar);
    const avatarPayload = {
      avatar: updatedUser.avatar || '',
      avatarVersion: updatedUser.avatarVersion || 0,
    };

    await Promise.all([
      redis.set(`avatar:${userId}`, JSON.stringify(avatarPayload), 'EX', 600),
      redis.del(`user:${userId}`),
    ]);

    return avatarPayload;
  } catch (err) {
    console.log(err);
    throw createError({ statusCode: 400, message: 'Failed to update avatar.' });
  }
});
