import {getCurrentUser} from "~/server/controllers/userController/userController";
import {verifyToken} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
    const query:any = getQuery(event);
    const authHeader = event.req.headers['authorization'];

    if (!authHeader) {
        throw createError({ statusCode: 401, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user) {
        throw createError({ statusCode: 401, message: 'Invalid token' });
    }
    return await getCurrentUser(query);
});