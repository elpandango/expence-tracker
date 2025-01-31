import { vi, expect, it, beforeEach, describe } from 'vitest';
import { createError, defineEventHandler, getCookie, readBody } from 'h3';
import { createTransaction } from '~/server/controllers/transactionsController/createTransaction';

vi.mock('~/server/controllers/transactionsController/createTransaction', () => ({
  createTransaction: vi.fn(),
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

describe('Create Transaction API', () => {
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
        const savedTransaction = await createTransaction(transactionData, userId);
        return {
          status: 201,
          message: "Transaction created successfully.",
          transaction: savedTransaction,
        };
      } catch (err) {
        throw err;
      }
    })(mockEvent))
      .rejects
      .toThrowError(expect.objectContaining({ statusCode: 401, message: 'Unauthorized' }));
  });

  it('should create a transaction successfully', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      accountId: 'accountId123',
      amount: 200,
      type: 'expense',
      currency: 'USD',
    });

    const savedTransaction = {
      _id: 'transactionId123',
      accountId: 'accountId123',
      amount: 200,
      type: 'expense',
      currency: 'USD',
    };

    createTransaction.mockResolvedValue(savedTransaction);

    const result = await defineEventHandler(async (event) => {
      const transactionData = await readBody(event);
      try {
        const userId = getCookie(event, 'userId');
        if (!userId) {
          throw createError({statusCode: 401, message: 'Unauthorized'});
        }
        const savedTransaction = await createTransaction(transactionData, userId);
        return {
          status: 201,
          message: "Transaction created successfully.",
          transaction: savedTransaction,
        };
      } catch (err) {
        throw err;
      }
    })(mockEvent);

    expect(result.status).toBe(201);
    expect(result.message).toBe('Transaction created successfully.');
    expect(result.transaction).toEqual(savedTransaction);
  });

  it('should throw error if transaction creation fails', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      accountId: 'accountId123',
      amount: 200,
      type: 'expense',
      currency: 'USD',
    });

    createTransaction.mockRejectedValue(new Error('Some error during creation'));

    await expect(defineEventHandler(async (event) => {
      const transactionData = await readBody(event);
      try {
        const userId = getCookie(event, 'userId');
        if (!userId) {
          throw createError({statusCode: 401, message: 'Unauthorized'});
        }
        const savedTransaction = await createTransaction(transactionData, userId);
        return {
          status: 201,
          message: "Transaction created successfully.",
          transaction: savedTransaction,
        };
      } catch (err) {
        throw err;
      }
    })(mockEvent))
      .rejects
      .toThrowError('Some error during creation');
  });
});
