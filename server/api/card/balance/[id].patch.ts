import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import { CardModel } from '~/server/models/CardModel';
import { CardDepositModel } from '~/server/models/CardDepositModel';

export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    const userId = getCookie(event, 'userId');
    const { amount, description, currency = 'USD' } = await readBody(event);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Valid positive amount is required.',
      });
    }

    const card = await CardModel.findOne({ _id: id, userId });
    if (!card) {
      throw createError({
        statusCode: 404,
        message: 'Card not found or does not belong to the user.',
      });
    }

    card.balance += numericAmount;
    await card.save();

    const cardDeposit = new CardDepositModel({
      userId,
      cardId: card._id,
      amount: numericAmount,
      description: description || `Deposit to card "${card.name}"`,
      currency: currency,
    });

    await cardDeposit.save();

    return {
      status: 200,
      message: 'Card balance updated successfully.',
      card: {
        id: card._id,
        name: card.name,
        balance: card.balance,
        currency: card.currency,
      },
      deposit: {
        id: cardDeposit._id,
        amount: cardDeposit.amount,
        description: cardDeposit.description,
        date: cardDeposit.date,
        currency: cardDeposit.currency,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: error.statusCode || 500,
      message: error.message || 'Internal server error',
    };
  }
});
