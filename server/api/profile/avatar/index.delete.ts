import { deleteAvatar } from '~/server/controllers/userController/userController';
import {getCookie} from "h3";

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');

  try {
    const user = await deleteAvatar(userId);
    return user;
  } catch (err) {
    throw createError({ statusCode: 400, message: 'Failed to delete avatar.' });
  }
});
