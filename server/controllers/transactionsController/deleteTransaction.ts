import {TransactionModel} from "~/server/models/TransactionModel";
import {AccountModel} from "~/server/models/AccountModel";

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