import {authLogin} from "~/server/controllers/authController/authLogin";
import {readBody, setCookie} from 'h3';

interface LoginResponse {
  status: number;
  userId: string;
}

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const {email, password} = await readBody(event);
  const cookieAge = 60 * 60 * 24 * 7;

  try {
    const {token, userId} = await authLogin({email, password});

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieAge,
    });

    setCookie(event, 'userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieAge,
    });

    setCookie(event, 'isAuthenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieAge,
    });

    return {status: 200, userId};
  } catch (err) {
    throw err;
  }
});
