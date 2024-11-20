import { updateProfile } from "~/server/controllers/userController/userController";
import { readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.id;
  const { name, lastName, email } = await readBody(event);

  if (!userId) {
    throw createError({ statusCode: 400, message: "User ID is required." });
  }

  try {
    const updatedUser = await updateProfile(userId, { name, lastName, email });
    return updatedUser;
  } catch (err) {
    throw err;
  }
});