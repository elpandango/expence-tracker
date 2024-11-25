import {UserModel} from "~/server/models/UserModel";
import {CardModel} from "~/server/models/CardModel";
import {ExpenseModel} from "~/server/models/ExpenseModel";
import {CashBalanceModel} from "~/server/models/CashBalanceModel";
import {getCookie} from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = getCookie(event, 'userId');
  const {cardId, amount, description, date, category, isCash} = body;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw createError({statusCode: 404, message: 'User not found'});
  }

  if (cardId && !user.cards.some((card) => card._id.toString() === cardId)) {
    throw createError({statusCode: 400, message: 'Invalid cardId'});
  }

  if (isCash) {
    const cashBalance = await CashBalanceModel.findOne({userId, currency: 'USD'});
    if (!cashBalance || cashBalance.amount < amount) {
      throw createError({statusCode: 400, message: 'Insufficient cash balance'});
    }
  }

  const expense = new ExpenseModel({
    userId,
    cardId: isCash ? null : cardId,
    amount,
    description,
    date: date || new Date(),
    category,
  });

  await expense.save();

  if (cardId) {
    await CardModel.findByIdAndUpdate(cardId, {$inc: {balance: -amount}});
  } else if (isCash) {
    await CashBalanceModel.updateOne(
      {userId, currency: 'USD'},
      {$inc: {amount: -amount}}
    );
  }

  return {status: 200, message: 'Expense added successfully', expense};
});
