import { deleteTransaction } from "~/server/controllers/transactionsController/deleteTransaction";
import { TransactionModel } from "~/server/models/TransactionModel";
import { AccountModel } from "~/server/models/AccountModel";
import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock("~/server/models/TransactionModel");
vi.mock("~/server/models/AccountModel");

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
    readBody: vi.fn(),
  };
});

vi.stubGlobal('createError', vi.fn((error) => error));

describe("deleteTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete an expense transaction and update the account balance", async () => {
    const transactionId = "txn123";
    const accountId = "acc123";

    const mockTransaction = {
      _id: transactionId,
      accountId,
      type: "expense",
      amount: 50,
      currency: "EUR",
    };

    const mockAccount = {
      _id: accountId,
      currency: "EUR",
      balance: 200,
    };

    TransactionModel.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockTransaction),
    });

    TransactionModel.findByIdAndDelete.mockResolvedValue(null);
    AccountModel.findById.mockResolvedValue(mockAccount);
    AccountModel.findByIdAndUpdate.mockResolvedValue(null);

    await deleteTransaction(transactionId);

    expect(TransactionModel.findById).toHaveBeenCalledWith(transactionId);
    expect(TransactionModel.findByIdAndDelete).toHaveBeenCalledWith(transactionId);
    expect(AccountModel.findByIdAndUpdate).toHaveBeenCalledWith(accountId, { $inc: { balance: 50 } });
  });

  it("should throw a 404 error if transaction is not found", async () => {
    TransactionModel.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(deleteTransaction("invalidId")).rejects.toThrow("Transaction not found");
  });

  it("should throw a 400 error if no transaction ID is provided", async () => {
    await expect(deleteTransaction("")).rejects.toThrow("Transaction ID is required");
  });

  it("should delete a transfer transaction and update both account balances", async () => {
    const transactionId = "txn456";
    const accountId = "acc123";
    const relatedAccountId = "acc456";

    const mockTransaction = {
      _id: transactionId,
      accountId,
      relatedAccountId,
      type: "transfer",
      amount: 100,
      currency: "USD",
    };

    const sourceAccount = { _id: accountId, currency: "USD", balance: 500 };
    const destinationAccount = { _id: relatedAccountId, currency: "USD", balance: 200 };

    TransactionModel.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockTransaction),
    });
    TransactionModel.findByIdAndDelete.mockResolvedValue(null);
    AccountModel.findById.mockImplementation((id) => {
      if (id === accountId) return Promise.resolve(sourceAccount);
      if (id === relatedAccountId) return Promise.resolve(destinationAccount);
      return null;
    });
    AccountModel.findByIdAndUpdate.mockResolvedValue(null);

    await deleteTransaction(transactionId);

    expect(TransactionModel.findByIdAndDelete).toHaveBeenCalledWith(transactionId);
    expect(AccountModel.findByIdAndUpdate).toHaveBeenCalledWith(accountId, { $inc: { balance: -100 } });
    expect(AccountModel.findByIdAndUpdate).toHaveBeenCalledWith(relatedAccountId, { $inc: { balance: 100 } });
  });
});