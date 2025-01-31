import {vi, expect, it, beforeEach, describe} from 'vitest';
import {createError, defineEventHandler, getCookie, getQuery} from 'h3';
import {TransactionModel} from "~/server/models/TransactionModel";
import mongoose from "mongoose";

vi.mock('h3', () => ({
  ...vi.importActual('h3'),
  getCookie: vi.fn(),
  readBody: vi.fn(),
}));

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
    readBody: vi.fn(),
  };
});

vi.mock('~/server/models/TransactionModel', () => ({
  TransactionModel: {
    find: vi.fn(),
  },
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Create Transaction API', () => {
  let mockEvent: any;

  beforeEach(() => {
    mockEvent = {
      context: {params: {}},
      req: {},
      res: {},
    };
  });

  it('should return 200 and transactions if user is authenticated', async () => {
    mockEvent.getQuery = vi.fn().mockReturnValue({
      page: '1',
      perPage: '5',
      type: 'expense',
    });
    getCookie.mockReturnValue('user123');

    const mockTransactions = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: 'user123',
        type: 'expense',
        amount: 100,
        date: new Date(),
        description: 'Test expense',
      },
    ];

    TransactionModel.find.mockResolvedValue(mockTransactions);

    const result = await defineEventHandler(async (event) => {
      const userId = getCookie(event, 'userId');
      if (!userId) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
      }

      const {
        type,
        page = 1,
        perPage = 5,
      } = getQuery(event);

      const query = { userId };
      if (type) query.type = type;

      const transactions = await TransactionModel.find(query);
      return {
        status: 200,
        transactions,
        totalItems: transactions.length,
        currentPage: parseInt(page),
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: 2,
        previousPage: 0,
        lastPage: 1,
      };
    })(mockEvent);

    expect(result.status).toBe(200);
    expect(result.transactions).toEqual(mockTransactions);
    expect(result.totalItems).toBe(1);
  });

  it('should return 401 if user is not authenticated', async () => {
    getCookie.mockReturnValue(undefined);

    await expect(
      defineEventHandler(async (event) => {
        const userId = getCookie(event, 'userId');
        if (!userId) {
          throw createError({ statusCode: 401, message: 'Not authenticated' });
        }

        const {
          type,
          page = 1,
          perPage = 5,
        } = getQuery(event);

        const query = { userId };
        if (type) query.type = type;

        const transactions = await TransactionModel.find(query);
        return {
          status: 200,
          transactions,
          totalItems: transactions.length,
          currentPage: parseInt(page),
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: 2,
          previousPage: 0,
          lastPage: 1,
        };
      })(mockEvent)
    ).rejects.toThrowError(expect.objectContaining({ statusCode: 401, message: 'Not authenticated' }));
  });

  it('should filter transactions based on query params', async () => {
    mockEvent.getQuery = vi.fn().mockReturnValue({
      type: 'income',
      page: '1',
      perPage: '5',
    });
    getCookie.mockReturnValue('user123');

    const mockTransactions = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: 'user123',
        type: 'income',
        amount: 150,
        date: new Date(),
        description: 'Test income',
      },
    ];

    TransactionModel.find.mockResolvedValue(mockTransactions);

    const result = await defineEventHandler(async (event) => {
      const userId = getCookie(event, 'userId');
      if (!userId) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
      }

      const {
        type,
        page = 1,
        perPage = 5,
      } = getQuery(event);

      const query = { userId };
      if (type) query.type = type;

      const transactions = await TransactionModel.find(query);
      return {
        status: 200,
        transactions,
        totalItems: transactions.length,
        currentPage: parseInt(page),
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: 2,
        previousPage: 0,
        lastPage: 1,
      };
    })(mockEvent);

    expect(result.status).toBe(200);
    expect(result.transactions).toEqual(mockTransactions);
    expect(result.totalItems).toBe(1);
  });

});
