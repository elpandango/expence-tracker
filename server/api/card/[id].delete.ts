import { defineEventHandler, createError, getCookie } from 'h3';
import { CardModel } from '~/server/models/CardModel';

export default defineEventHandler(async (event) => {
  try {
    const userId = getCookie(event, 'userId');
    const { id } = event.context.params;

    const card = await CardModel.findOne({ _id: id, userId });

    if (!card) {
      throw createError({
        statusCode: 404,
        message: 'Card not found',
      });
    }

    await CardModel.deleteOne({ _id: id });

    return {
      status: 200,
      message: 'Card deleted successfully',
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.statusCode || 500,
      message: error.message || 'Internal server error',
    };
  }
});
