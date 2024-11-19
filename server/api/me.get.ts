import { createError } from 'h3';
import {verifyToken} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const token = parseCookies(event).auth_token;

  if (!token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' });
  }

  const userData = verifyToken(token);
  return { user: userData };
});
