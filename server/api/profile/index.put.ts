import { updateProfile } from "~/server/controllers/userController/userController";
import {getCookie, readBody, defineEventHandler} from 'h3';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  const { name, lastName, email } = await readBody(event);

  if (!userId) {
    throw createError({ statusCode: 400, message: "User ID is required." });
  }

  try {
    const updatedUser = await updateProfile(userId, { name, lastName, email });
    return {
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      avatar: updatedUser?.avatar ?? '',
    };
  } catch (err) {
    console.error("Error during update process: ", err);
    throw err;
  }
});
