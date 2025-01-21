import mongoose from "mongoose";
import {TransactionModel} from "~/server/models/TransactionModel";
import {AccountModel} from "~/server/models/AccountModel";

export const updateTransaction = async (updatedTransaction: any, id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({statusCode: 400, message: "Invalid transaction ID format"});
  }

  const transactionId = new mongoose.Types.ObjectId(id);
  const oldTransaction = await TransactionModel.findOne({_id: transactionId, userId});

  if (!oldTransaction) {
    throw createError({statusCode: 404, message: "Transaction not found"});
  }

  const account = await AccountModel.findOne({_id: updatedTransaction.accountId, userId});
  if (!account) {
    throw createError({statusCode: 404, message: "Account not found"});
  }

  if (account.currency !== updatedTransaction.currency) {
    throw createError({
      statusCode: 400,
      message: `Currency mismatch: Account currency (${account.currency}) does not match transaction currency (${updatedTransaction.currency}).`,
    });
  }

  const isAmountChanged = oldTransaction.amount !== updatedTransaction.amount;
  const isAccountChanged = oldTransaction.accountId.toString() !== updatedTransaction.accountId;
  const isTypeChanged = oldTransaction.type !== updatedTransaction.type;
  const isDescriptionChanged = oldTransaction.description !== updatedTransaction.description;
  const formatDate = (date: string) => new Date(date).toISOString().split('T')[0];
  const isDateChanged = formatDate(oldTransaction.date) !== formatDate(updatedTransaction.date);

  if (isAmountChanged || isAccountChanged || isTypeChanged || isDateChanged || isDescriptionChanged) {
    const oldAccount = await AccountModel.findById(oldTransaction.accountId);
    if (oldAccount) {
      if (oldTransaction.type === "expense") {
        oldAccount.balance += oldTransaction.amount;
      } else if (oldTransaction.type === "income") {
        oldAccount.balance -= oldTransaction.amount;
      }
      await oldAccount.save();
    }

    await TransactionModel.findByIdAndDelete(transactionId);

    const newTransaction = new TransactionModel({
      ...updatedTransaction,
      userId,
    });

    const updatedAccount = await AccountModel.findById(updatedTransaction.accountId);
    if (updatedAccount) {
      if (updatedTransaction.type === "expense") {
        updatedAccount.balance -= updatedTransaction.amount;
      } else if (updatedTransaction.type === "income") {
        updatedAccount.balance += updatedTransaction.amount;
      }
      await updatedAccount.save();
    }

    return await newTransaction.save();
  } else {
    return null;
  }
};