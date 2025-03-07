import {createError} from 'h3';
import {verifyToken} from "~/server/utils/auth";
import {UserModel} from '../models/UserModel';
import redis from '~/server/utils/redis';

export default defineEventHandler(async (event) => {
  const token = parseCookies(event).auth_token;

  if (!token) {
    throw createError({statusCode: 401, message: 'Not authenticated'});
  }

  const userData = verifyToken(token);
  const userId = userData?.userId;

  //Redis usage
  const cachedUser = await redis.get(`user:${userId}`);

  if (cachedUser) {
    return {
      user: JSON.parse(cachedUser)
    }
  }

  const user = await UserModel.findById(userId, 'name lastName email');

  if (!user) {
    throw createError({statusCode: 404, message: 'User not found'});
  }

  //Cache user in Redis
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 600);

  await redis.set("testKey", "Hello from Upstash!", 'EX', 600);
  const value = await redis.get("testKey");

  return {
    user: {
      userId: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
    },
    testMsg: value
  };
});
