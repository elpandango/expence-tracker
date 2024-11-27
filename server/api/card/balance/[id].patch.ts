import {defineEventHandler, readBody, createError, getCookie} from 'h3';
import {CardModel} from "~/server/models/CardModel";

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    const userId = getCookie(event, 'userId');
    const {amount} = await readBody(event);

    const numberAmount = parseFloat(amount);
    if (isNaN(numberAmount) || numberAmount <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Valid amount is required.',
      });
    }

    const card = await CardModel.findOne({ _id: id, userId });
    if (!card) {
      throw createError({
        statusCode: 404,
        message: 'Card not found or does not belong to the user.',
      });
    }

    if (card.balance + numberAmount < 0) {
      throw createError({
        statusCode: 400,
        message: 'Insufficient funds.',
      });
    }

    card.balance += numberAmount;
    await card.save();

    return {
      status: 200,
      message: 'Card balance updated successfully.',
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
