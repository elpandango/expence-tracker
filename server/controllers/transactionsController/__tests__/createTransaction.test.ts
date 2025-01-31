import {createTransaction} from "~/server/controllers/transactionsController/createTransaction";
import {describe, it, expect, vi} from "vitest";
import {getCookie} from "h3";
import handler from "~/server/api/transactions/index.post";
import {TransactionModel} from '~/server/models/TransactionModel';
import {AccountModel} from '~/server/models/AccountModel';

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

describe("createTransaction", () => {
  it("should throw an error if required fields are missing", async () => {
    const mockEvent = {type: "expense", amount: 100};

    await expect(createTransaction(mockEvent, "user123")).rejects.toThrow(
      "Missing required fields: accountId, type, amount, or currency."
    );
  });

  it("should throw an error if type is invalid", async () => {
    const mockEvent = {
      accountId: "123",
      type: "cash",
      amount: 100,
      currency: "EUR",
    };

    await expect(createTransaction(mockEvent, "user123"))
      .rejects.toThrow("Invalid transaction type");
  });

  it("should throw an error if amount is zero or negative", async () => {
    const mockEvent = {
      accountId: "123",
      type: "expense",
      amount: -10,
      currency: "EUR",
      description: "Test transaction",
      date: new Date(),
      category: "Food",
    };

    const mockEvent2 = {
      accountId: "123",
      type: "expense",
      amount: 0,
      currency: "EUR",
      description: "Test transaction",
      date: new Date(),
      category: "Food",
    };

    await expect(createTransaction(mockEvent, "user123")).rejects.toThrow(
      "Amount must be a positive number."
    );

    await expect(createTransaction(mockEvent2, "user123")).rejects.toThrow(
      "Amount must be a positive number."
    );
  });

  it("should create a transaction successfully", async () => {
    const userId = "user123";
    const accountId = "account123";

    const transactionData = {
      accountId,
      type: "expense",
      amount: 50,
      currency: "EUR",
      description: "Groceries",
      date: new Date("2024-01-31"),
      category: "Food",
    };

    const mockAccount = {
      _id: accountId,
      userId,
      currency: "EUR",
      balance: 200,
    };

    AccountModel.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockAccount),
    });

    AccountModel.findByIdAndUpdate.mockResolvedValue(null);

    const savedTransaction = {
      ...transactionData,
      userId,
      _id: "transaction123",
    };
    TransactionModel.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(savedTransaction),
    }));

    const result = await createTransaction(transactionData, userId);

    expect(AccountModel.findByIdAndUpdate).toHaveBeenCalledWith(accountId, {
      balance: 150,
    });

    expect(TransactionModel).toHaveBeenCalledWith(expect.objectContaining({
      userId,
      accountId,
      type: "expense",
      amount: 50,
      currency: "EUR",
      description: "Groceries",
      date: new Date("2024-01-31"),
      category: "Food",
    }));

    expect(result).toEqual(savedTransaction);
  });
});
