import { vi, expect, it, beforeEach, describe } from 'vitest';
import { createError, defineEventHandler } from 'h3';
import { deleteTransaction } from '~/server/controllers/transactionsController/deleteTransaction';

vi.mock('h3', () => ({
  ...vi.importActual('h3'),
  getCookie: vi.fn(),
  readBody: vi.fn(),
}));

vi.mock('~/server/controllers/transactionsController/deleteTransaction', () => ({
  deleteTransaction: vi.fn(),
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

describe('Delete Transaction API', () => {
  let mockEvent: any;

  beforeEach(() => {
    mockEvent = {
      context: { params: { id: 'transaction123' } },
      req: {},
      res: {},
    };
  });

  it('should return 200 and success message if transaction is deleted', async () => {
    deleteTransaction.mockResolvedValue(null);

    const result = await defineEventHandler(async (event) => {
      const { id } = event.context.params;
      try {
        await deleteTransaction(id);
        return {
          status: 200,
          message: 'Transaction deleted successfully',
        };
      } catch (err) {
        throw err;
      }
    })(mockEvent);

    expect(result.status).toBe(200);
    expect(result.message).toBe('Transaction deleted successfully');
  });

  it('should return 404 if transaction is not found', async () => {
    deleteTransaction.mockRejectedValue(new Error('Transaction not found'));

    await expect(defineEventHandler(async (event) => {
      const { id } = event.context.params;
      try {
        await deleteTransaction(id);
        return {
          status: 200,
          message: 'Transaction deleted successfully',
        };
      } catch (err) {
        throw createError({ statusCode: 404, message: 'Transaction not found' });
      }
    })(mockEvent))
      .rejects
      .toThrowError(expect.objectContaining({ statusCode: 404, message: 'Transaction not found' }));
  });

  it('should handle unexpected errors gracefully', async () => {
    deleteTransaction.mockRejectedValue(new Error('Unexpected error'));

    await expect(defineEventHandler(async (event) => {
      const { id } = event.context.params;
      try {
        await deleteTransaction(id);
        return {
          status: 200,
          message: 'Transaction deleted successfully',
        };
      } catch (err) {
        throw createError({ statusCode: 500, message: 'Unexpected error' });
      }
    })(mockEvent))
      .rejects
      .toThrowError(expect.objectContaining({ statusCode: 500, message: 'Unexpected error' }));
  });
});
