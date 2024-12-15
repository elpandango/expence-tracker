import mongoose from "mongoose";
import { CashDepositModel } from "~/server/models/CashDepositModel";
import { CardDepositModel } from "~/server/models/CardDepositModel";
import { ExpenseModel } from "~/server/models/ExpenseModel";
import { CashBalanceModel } from "~/server/models/CashBalanceModel";
import { CardModel } from "~/server/models/CardModel";
import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const userId = getCookie(event, 'userId');
  const updatedTransaction = await readBody(event);

  const { oldData, newData } = updatedTransaction;

  const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
  if (!objectId) {
    throw createError({ statusCode: 400, message: "Invalid transaction ID format" });
  }

  let model;
  switch (oldData.source) {
    case "cash":
      model = oldData.sourceCategory === "expense" ? ExpenseModel : CashDepositModel;
      break;
    case "card":
      model = oldData.sourceCategory === "expense" ? ExpenseModel : CardDepositModel;
      break;
  }

  const oldTransaction = await model.findById(objectId).lean();
  if (!oldTransaction) {
    throw createError({ statusCode: 404, message: "Old transaction not found" });
  }

  const isTypeChanged = oldData.type !== newData.type || oldData.source !== newData.source;
  const isAmountChanged = oldData.amount !== newData.amount;

  const handleBalanceUpdate = async (source, amount, currency = "USD", cardId = null) => {
    if (source === "cash") {
      await CashBalanceModel.findOneAndUpdate(
        { userId, currency },
        { $inc: { amount: amount } },
        { new: true }
      );
    } else if (source === "card" && cardId) {
      await CardModel.findByIdAndUpdate(cardId, {
        $inc: { balance: amount }
      }, { new: true });
    }
  };

  if (isTypeChanged || isAmountChanged) {
    const returnAmount = oldData.sourceCategory === 'expense' ? oldTransaction.amount : -oldTransaction.amount;
    await handleBalanceUpdate(oldData.source, returnAmount, oldTransaction.currency, oldTransaction.cardId);
  }

  await model.findByIdAndDelete(id);

  let NewModel;
  switch (newData.source) {
    case "cash":
      NewModel = newData.sourceCategory === "expense" ? ExpenseModel : CashDepositModel;
      break;
    case "card":
      NewModel = newData.sourceCategory === "expense" ? ExpenseModel : CardDepositModel;
      break;
  }

  if (!NewModel) {
    throw createError({ statusCode: 400, message: "Invalid source or sourceCategory" });
  }

  const newTransaction = new NewModel({ ...newData, userId });
  await newTransaction.save();

  const newAmount = newData.sourceCategory === 'expense' ? -newData.amount : newData.amount;
  await handleBalanceUpdate(newData.source, newAmount, newData.currency, newData.cardId);

  const updatedTransactionResult = await NewModel.findByIdAndUpdate(newTransaction._id, newData, { new: true });

  return {
    status: 200,
    message: "Transaction updated successfully",
    transaction: updatedTransactionResult,
  };
});
