import {defineEventHandler, createError, getCookie} from 'h3';
import { CardModel } from '~/server/models/CardModel';

export default defineEventHandler(async (event) => {
  try {
    const userId = getCookie(event, 'userId');
    const { id } = event.context.params;

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required',
      });
    }

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Card ID is required',
      });
    }

    const card = await CardModel.findOne({ userId, _id: id });

    if (!card) {
      throw createError({
        statusCode: 404,
        message: 'Card not found for this user',
      });
    }

    return {
      status: 200,
      message: 'Card retrieved successfully',
      card,
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.statusCode || 500,
      message: error.message || 'Internal server error',
    };
  }
});
