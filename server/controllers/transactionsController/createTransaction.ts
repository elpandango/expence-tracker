import {TransactionModel} from "~/server/models/TransactionModel";
import {AccountModel} from "~/server/models/AccountModel";

export const createTransaction = async (transactionData: any, userId: string) => {
  const {accountId, type, amount, currency, description, date, category, relatedAccountId} = transactionData;

  if (!accountId || !type || amount === null || amount === undefined || !currency) {
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