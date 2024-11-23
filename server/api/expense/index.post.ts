import {UserModel} from "~/server/models/UserModel";
import {CardModel} from "~/server/models/CardModel";
import {ExpenseModel} from "~/server/models/ExpenseModel";
import {getCookie} from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = getCookie(event, 'userId');
  const { cardId, amount, description, date, category } = body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  if (cardId && !user.cards.some((card) => card._id.toString() === cardId)) {
    throw createError({ statusCode: 400, message: 'Invalid cardId' });
  }

  const expense = new ExpenseModel({
    userId,
    cardId,
    amount,
    description,
    date: date || new Date(),
    category,
  });

  await expense.save();

  if (cardId) {
    await CardModel.findByIdAndUpdate(cardId, { $inc: { balance: -amount } });
  }

  return { status: 200, message: 'Expense added successfully', expense };
});
