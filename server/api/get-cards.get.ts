import {defineEventHandler, createError, getCookie} from 'h3';
import { CardModel } from '~/server/models/CardModel';

export default defineEventHandler(async (event) => {
  try {
    const userId = getCookie(event, 'userId');
    const cards = await CardModel.find({ userId });

    if (!cards || cards.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No cards found for this user',
      });
    }

    return {
      status: 200,
      message: 'Cards retrieved successfully',
      cards,
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.statusCode || 500,
      message: error.message || 'Internal server error',
    };
  }
});
