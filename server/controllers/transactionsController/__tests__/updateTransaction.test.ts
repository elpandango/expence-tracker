import {updateTransaction} from "~/server/controllers/transactionsController/updateTransaction";
import {TransactionModel} from "~/server/models/TransactionModel";
import mongoose from "mongoose";
import {AccountModel} from "~/server/models/AccountModel";
import {describe, it, expect, vi, beforeEach} from 'vitest';

vi.mock("~/server/models/TransactionModel");
vi.mock("~/server/models/AccountModel");
// vi.mock("mongoose", () => ({
//   Types: {
//     ObjectId: {
//       isValid: vi.fn(),
//     },
//   },
// }));

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
    readBody: vi.fn(),
  };
});

vi.stubGlobal('createError', vi.fn((error) => error));

describe('updateTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw 400 if transaction ID format is invalid", async () => {
    const userId = "user123";

    await expect(updateTransaction({}, "invalid_id", userId)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 400, message: "Invalid transaction ID format" })
    );
  });

  it("should throw 404 if transaction is not found", async () => {
    const userId = "user123";
    const accountId = new mongoose.Types.ObjectId().toString();
    (TransactionModel.findOne as vi.Mock).mockResolvedValue(null);

    await expect(updateTransaction({}, accountId, userId)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404, message: "Transaction not found" })
    );
  });

  it("should update the transaction successfully", async () => {
    const userId = "user123";
    const accountId = new mongoose.Types.ObjectId();
    const transactionId = new mongoose.Types.ObjectId();
    const oldTransaction = {
      _id: transactionId,
      accountId: accountId,
      userId,
      type: "expense",
      amount: 100,
      currency: "USD",
      date: new Date(),
    };
    const updatedTransaction = {
      accountId: accountId,
      type: "income",
      amount: 150,
      currency: "USD",
      date: new Date(),
    };

    (TransactionModel.findOne as vi.Mock).mockResolvedValue(oldTransaction);
    (AccountModel.findOne as vi.Mock).mockResolvedValue({ currency: "USD", balance: 1000 });
    (AccountModel.findById as vi.Mock).mockResolvedValue({ balance: 1000, save: vi.fn() });
    (TransactionModel.findByIdAndDelete as vi.Mock).mockResolvedValue({});
    (TransactionModel.prototype.save as vi.Mock).mockResolvedValue(updatedTransaction);

    const result = await updateTransaction(updatedTransaction, transactionId.toString(), userId);

    expect(TransactionModel.findByIdAndDelete).toHaveBeenCalledWith(transactionId);
    expect(TransactionModel.prototype.save).toHaveBeenCalled();
    expect(result).toEqual(updatedTransaction);
  });

});