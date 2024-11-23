import {defineEventHandler, createError, readBody, getCookie} from 'h3';
import { UserModel } from "~/server/models/UserModel";
import { CardModel } from "~/server/models/CardModel";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = getCookie(event, 'userId');
  const { name, number, balance, currency } = body;

  if (!userId || !name || !currency) {
    throw createError({ statusCode: 400, message: 'Missing required fields' });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  const newCard = new CardModel({
    userId,
    name,
    number,
    balance,
    currency,
  });

  await newCard.save();

  user.cards.push(newCard._id);
  await user.save();

  return { status: 200, message: 'Card added successfully', card: newCard };
});
