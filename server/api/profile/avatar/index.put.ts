import { updateAvatar } from '~/server/controllers/userController';
import {getCookie, readBody} from 'h3';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const { avatar } = await readBody(event);

  try {
    const user = await updateAvatar(userId, avatar);
    return user;
  } catch (err) {
    throw createError({ statusCode: 400, message: 'Failed to update avatar.' });
  }
});
