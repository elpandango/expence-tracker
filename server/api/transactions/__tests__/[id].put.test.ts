import { vi, expect, it, beforeEach, describe } from 'vitest';
import { createError, defineEventHandler, getCookie, readBody } from 'h3';
import { updateTransaction } from '~/server/controllers/transactionsController/updateTransaction';

vi.mock('h3', () => ({
  ...vi.importActual('h3'),
  getCookie: vi.fn(),
  readBody: vi.fn(),
}));

vi.mock('~/server/controllers/transactionsController/updateTransaction', () => ({
  updateTransaction: vi.fn(),
}));

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
    readBody: vi.fn(),
  };
});

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Update Transaction API', () => {
  let mockEvent: any;

  beforeEach(() => {
    mockEvent = {
      context: {},
      req: {},
      res: {},
    };
  });

  it('should return 401 if user is not authorized', async () => {
    getCookie.mockReturnValue(undefined);

    await expect(defineEventHandler(async (event) => {
      const transactionData = await readBody(event);
      try {
        const userId = getCookie(event, 'userId');
        if (!userId) {
          throw createError({statusCode: 401, message: 'Unauthorized'});
        }
        const savedTransaction = await updateTransaction(transactionData, userId);
        return {
          status: 200,
          message: "Transaction updated successfully.",
          transaction: savedTransaction,
        };
      } catch (err) {
        throw err;
      }
    })(mockEvent))
      .rejects
      .toThrowError(expect.objectContaining({ statusCode: 401, message: 'Unauthorized' }));
  });

  it('should update transaction successfully', async () => {
    const userId = 'user123';
    const updatedTransactionData = {
      accountId: 'account123',
      type: 'income',
      amount: 200,
      currency: 'USD',
    };

    getCookie.mockReturnValue(userId);
    readBody.mockResolvedValue(updatedTransactionData);

    const updatedTransaction = {
      _id: 'transaction123',
      accountId: updatedTransactionData.accountId,
      type: updatedTransactionData.type,
      amount: updatedTransactionData.amount,
      currency: updatedTransactionData.currency,
      date: new Date(),
    };

    updateTransaction.mockResolvedValue(updatedTransaction);

    const result = await defineEventHandler(async (event) => {
      const userId = getCookie(event, 'userId');
      const { accountId, type, amount, currency } = await readBody(event);

      if (!userId) {
        throw createError({ statusCode: 400, message: "User ID is required." });
      }

      try {
        const updatedTransaction = await updateTransaction(accountId, { type, amount, currency }, userId);
        return updatedTransaction;
      } catch (err) {
        throw err;
      }
    })(mockEvent);

    expect(result.accountId).toBe(updatedTransaction.accountId);
    expect(result.type).toBe(updatedTransaction.type);
    expect(result.amount).toBe(updatedTransaction.amount);
    expect(result.currency).toBe(updatedTransaction.currency);
  });

  it('should throw error if transaction update fails', async () => {
    const userId = 'user123';
    const updatedTransactionData = {
      accountId: 'account123',
      type: 'income',
      amount: 200,
      currency: 'USD',
    };

    getCookie.mockReturnValue(userId);
    readBody.mockResolvedValue(updatedTransactionData);

    updateTransaction.mockRejectedValue(new Error('Error updating transaction'));

    await expect(defineEventHandler(async (event) => {
      const userId = getCookie(event, 'userId');
      const { accountId, type, amount, currency } = await readBody(event);

      if (!userId) {
        throw createError({ statusCode: 400, message: "User ID is required." });
      }

      try {
        const updatedTransaction = await updateTransaction(accountId, { type, amount, currency }, userId);
        return updatedTransaction;
      } catch (err) {
        throw err;
      }
    })(mockEvent))
      .rejects
      .toThrowError('Error updating transaction');
  });
});
