import mongoose from "mongoose";
import {TransactionModel} from "~/server/models/TransactionModel";
import {AccountModel} from "~/server/models/AccountModel";
import {defineEventHandler, getCookie, readBody} from "h3";

export const createTransaction = async (transactionData: any, userId: string) => {
  const {accountId, type, amount, currency, description, date, category, relatedAccountId} = transactionData;

  if (!accountId || !type || !amount || !currency) {
    throw createError({statusCode: 400, message: "Missing required fields: accountId, type, amount, or currency."});
  }

  if (!["expense", "income", "transfer"].includes(type)) {
    throw createError({statusCode: 400, message: "Invalid transaction type."});
  }

  if (amount <= 0) {
    throw createError({statusCode: 400, message: "Amount must be a positive number."});
  }

  const account = await AccountModel.findOne({_id: accountId, userId}).lean();
  if (!account) {
    throw createError({statusCode: 404, message: "Account not found."});
  }

  if (account.currency !== currency) {
    throw createError({
      statusCode: 400,
      message: `Currency mismatch: Account currency (${account.currency}) does not match transaction currency (${currency}).`,
    });
  }

  if (type === "expense") {
    account.balance -= amount;
  } else if (type === "income") {
    account.balance += amount;
  }

  if (account.balance < 0) {
    throw createError({statusCode: 400, message: "Insufficient funds."});
  }

  await AccountModel.findByIdAndUpdate(accountId, {balance: account.balance});

  const transaction = new TransactionModel({
    userId,
    accountId,
    type,
    amount,
    currency,
    description: description || "",
    date: date || new Date(),
    category: category || null,
    relatedAccountId: type === "transfer" ? relatedAccountId : null,
  });

  return await transaction.save();
};

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

export const deleteTransaction = async (id: string) => {
  if (!id) {
    throw createError({ statusCode: 400, message: "Transaction ID is required" });
  }

  const transaction = await TransactionModel.findById(id).lean();
  if (!transaction) {
    throw createError({ statusCode: 404, message: "Transaction not found" });
  }

  const { accountId, relatedAccountId, type, amount, currency } = transaction;

  await TransactionModel.findByIdAndDelete(id);

  if (type === "expense" || type === "income") {
    const balanceUpdate = type === "expense" ? amount : -amount;

    const account = await AccountModel.findById(accountId);
    if (!account) {
      throw createError({ statusCode: 404, message: "Account not found" });
    }
    if (account.currency !== currency) {
      throw createError({
        statusCode: 400,
        message: `Currency mismatch: Account currency (${account.currency}) does not match transaction currency (${currency}).`,
      });
    }

    await AccountModel.findByIdAndUpdate(accountId, { $inc: { balance: balanceUpdate } });
  }

  if (type === "transfer" && relatedAccountId) {
    const sourceUpdate = -amount;
    const destinationUpdate = amount;

    const sourceAccount = await AccountModel.findById(accountId);
    const destinationAccount = await AccountModel.findById(relatedAccountId);

    if (!sourceAccount || !destinationAccount) {
      throw createError({ statusCode: 404, message: "Source or destination account not found" });
    }

    if (sourceAccount.currency !== currency || destinationAccount.currency !== currency) {
      throw createError({
        statusCode: 400,
        message: `Currency mismatch: Account currencies must match transaction currency (${currency}).`,
      });
    }

    await AccountModel.findByIdAndUpdate(accountId, { $inc: { balance: sourceUpdate } });
    await AccountModel.findByIdAndUpdate(relatedAccountId, { $inc: { balance: destinationUpdate } });
  }
};

export const getTransactions = async (userId: string) => {

};