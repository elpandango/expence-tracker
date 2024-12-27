import { authLogin } from "~/server/controllers/authController/authLogin";
import { readBody, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);
    const cookieAge = 60 * 60 * 24 * 7;

    try {
        const { token, userId } = await authLogin({ email, password });

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

        return { status: 200, userId };
    } catch (err) {
        if (err.message === 'Invalid email') {
            return { status: 400, field: 'email', message: 'Invalid email address' };
        } else if (err.message === 'Invalid password') {
            return { status: 400, field: 'password', message: 'Incorrect password' };
        }
        throw err;
    }
});
