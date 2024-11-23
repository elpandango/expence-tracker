import {createError} from 'h3';
import {verifyToken} from "~/server/utils/auth";
import {UserModel} from '../models/UserModel';

export default defineEventHandler(async (event) => {
  const token = parseCookies(event).auth_token;

  if (!token) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const userData = verifyToken(token);
  const userId = userData?.userId;

  const user = await UserModel.findById(userId, 'name lastName email avatar');

  if (!user) {
    throw createError({statusCode: 404, message: 'User not found'});
  }

  return {
    user: {
      userId: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    }
  };
});
