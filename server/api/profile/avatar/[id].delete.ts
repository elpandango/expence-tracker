import { deleteAvatar } from '~/server/controllers/userController/userController';

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.id;

  try {
    const user = await deleteAvatar(userId);
    return user;
  } catch (err) {
    throw createError({ statusCode: 400, message: 'Failed to delete avatar.' });
  }
});
