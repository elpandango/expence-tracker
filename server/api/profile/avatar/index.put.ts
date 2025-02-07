import {updateAvatar} from '~/server/controllers/userController/userController';
import {getCookie, readBody} from 'h3';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const { avatar } = await readBody(event);

  try {
    return await updateAvatar(userId, avatar);
  } catch (err) {
    console.log(err);
    throw createError({ statusCode: 400, message: 'Failed to update avatar.' });
  }
});
