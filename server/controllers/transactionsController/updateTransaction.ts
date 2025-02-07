import mongoose from "mongoose";
import {TransactionModel} from "~/server/models/TransactionModel";
import {AccountModel} from "~/server/models/AccountModel";
import type {ITransaction} from "~/server/interfaces/transaction";

export const updateTransaction = async (updatedTransaction: ITransaction, id: string, userId: string) => {
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

  const formatDate = (date: string) => new Date(date).toISOString().split('T')[0];

  const hasTransactionChanged = [
    oldTransaction.amount !== updatedTransaction.amount,
    oldTransaction.category !== updatedTransaction.category,
    oldTransaction.accountId.toString() !== updatedTransaction.accountId,
    oldTransaction.type !== updatedTransaction.type,
    oldTransaction.description !== updatedTransaction.description,
    formatDate(oldTransaction.date) !== formatDate(updatedTransaction.date)
  ].some(Boolean);

  if (hasTransactionChanged) {
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