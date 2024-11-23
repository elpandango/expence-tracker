import { defineEventHandler, readBody, createError } from 'h3';
import { CardModel } from '~/server/models/CardModel';

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    const updatedData = await readBody(event);

    if (!updatedData.name && !updatedData.number && !updatedData.balance && !updatedData.currency) {
      throw createError({
        statusCode: 400,
        message: 'At least one field should be provided for update.',
      });
    }

    const existingCard = await CardModel.findById(id);
    if (!existingCard) {
      throw createError({
        statusCode: 404,
        message: 'Card not found',
      });
    }

    const updatedCard = await CardModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    return {
      status: 200,
      message: 'Card updated successfully',
      card: updatedCard,
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.statusCode || 500,
      message: error.message || 'Internal server error',
    };
  }
});
