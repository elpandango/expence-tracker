import { defineEventHandler, readBody, getCookie } from 'h3';
import { AccountModel } from '~/server/models/AccountModel';

export default defineEventHandler(async (event) => {
  const userId = getCookie(event, 'userId');
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const { name, type, currency, cardNumber, initialBalance } = await readBody(event);

  if (!name || !type || !currency) {
    throw createError({ statusCode: 400, message: 'Missing required fields' });
  }

  if (!['card', 'cash'].includes(type)) {
    throw createError({ statusCode: 400, message: 'Invalid account type' });
  }

  if (type === 'card' && !cardNumber) {
    throw createError({ statusCode: 400, message: 'Card number is required for card accounts' });
  }

  if (initialBalance !== undefined) {
    if (typeof initialBalance !== 'number' || initialBalance < 0) {
      throw createError({ statusCode: 400, message: 'Invalid initial balance' });
    }
  }

  const newAccount = new AccountModel({
    userId,
    name,
    type,
    currency,
    cardNumber: type === 'card' ? `**** **** **** ${cardNumber.slice(-4)}` : null,
    balance: initialBalance || 0,
  });

  await newAccount.save();

  return {
    status: 201,
    message: 'Account created successfully',
    account: newAccount,
  };
});
