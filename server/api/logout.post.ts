import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
    deleteCookie(event, 'userId');
    deleteCookie(event, 'auth_token');

    return {
        status: 200,
        message: 'Logged out successfully',
    };
});