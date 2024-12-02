import {UserModel} from "~/server/models/UserModel";
import {CardModel} from "~/server/models/CardModel";
import {CategoryModel} from "~/server/models/CategoryModel";
import {ExpenseModel} from "~/server/models/ExpenseModel";
import {CashBalanceModel} from "~/server/models/CashBalanceModel";
import {getCookie} from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = getCookie(event, 'userId');
  const {cardId, amount, description, date, category} = body;
  const numericAmount = Number(amount);
  const user = await UserModel.findById(userId);
  if (!user) {
    throw createError({statusCode: 404, message: 'User not found'});
  }

  if (isNaN(numericAmount)) {
    throw createError({statusCode: 400, message: 'Invalid amount'});
  }

  if (cardId && !user.cards.some((card) => card._id.toString() === cardId)) {
    throw createError({statusCode: 400, message: 'Invalid cardId'});
  }

  let categoryId = category;
  if (!categoryId) {
    const otherCategory = await CategoryModel.findOne({ name: 'Other (Expenses)' });
    if (!otherCategory) {
      throw createError({ statusCode: 404, message: 'Category "Other" not found' });
    }
    categoryId = otherCategory._id;
  }

  let maskedCardNumber = null;

  if (cardId) {
    const card = await CardModel.findById(cardId);
    if (!card) {
      throw createError({statusCode: 404, message: 'Card not found'});
    }

    if (card.balance < numericAmount) {
      throw createError({statusCode: 400, message: 'Insufficient card balance'});
    }
    maskedCardNumber = card.number;
  } else {
    const cashBalance = await CashBalanceModel.findOne({userId, currency: 'USD'});
    if (!cashBalance || cashBalance.amount < numericAmount) {
      throw createError({statusCode: 400, message: 'Insufficient cash balance'});
    }
  }
  const expense = new ExpenseModel({
    userId,
    cardId,
    amount,
    cardNumber: maskedCardNumber,
    description,
    date: date || new Date(),
    category: categoryId,
  });

  await expense.save();

  if (cardId) {
    await CardModel.findByIdAndUpdate(cardId, {$inc: {balance: -numericAmount}});
  } else {
    await CashBalanceModel.updateOne(
      {userId, currency: 'USD'},
      {$inc: {amount: -numericAmount}}
    );
  }

  return {status: 200, message: 'Expense added successfully', expense};
});
