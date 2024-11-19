import { authLogin } from "~/server/controllers/authController/authLogin";
import { readBody, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);

    try {
        const { token, userId } = await authLogin({ email, password });

        setCookie(event, 'auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
        });

        return { status: 200, userId };
    } catch (err) {
        throw err;
    }
});
