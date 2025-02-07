import {deleteAvatar} from '~/server/controllers/userController/userController';
import {getCookie} from "h3";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  try {
    return await deleteAvatar(userId);
  } catch (err) {
    console.log(err);
    throw createError({ statusCode: 400, message: 'Failed to delete avatar.' });
  }
});
