import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/charts/index.get';
import {getCookie, getQuery} from 'h3';

vi.mock('~/server/models/TransactionModel', () => ({
  TransactionModel: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        { date: new Date('2025-01-01'), type: 'income', amount: 100 },
        { date: new Date('2025-01-02'), type: 'expense', amount: 50 },
        { date: new Date('2025-01-03'), type: 'income', amount: 200 },
      ]),
    }),
    populate: vi.fn().mockReturnThis()
  },
}));

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
    getQuery: vi.fn(),
  };
});

vi.stubGlobal('createError', vi.fn((error) => error));

describe('GET /charts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    getCookie.mockReturnValue(null);
    const mockEvent = {};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 401, message: 'Not authenticated'})
    );
  });

  it('should return 400 for invalid chartType', async () => {
    getCookie.mockReturnValue('user123');
    const mockEvent = { context: { params: {} } };
    getQuery.mockReturnValue({ chartType: 'invalidType' });

    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 400,
      message: 'Invalid chart type',
    });
  });

  it('should return data for allTransactions chartType', async() => {
    getCookie.mockReturnValue('user123');
    const mockEvent = { context: { params: {} } };
    getQuery.mockReturnValue({ chartType: 'allTransactions', startDate: '2025-01-01', endDate: '2025-01-10' });

    const result = await handler(mockEvent);

    expect(result.status).toBe(200);
    expect(result.data.income).toEqual([{ date: '2025-01-01', amount: 100 }, { date: '2025-01-03', amount: 200 }]);
    expect(result.data.expense).toEqual([{ date: '2025-01-02', amount: 50 }]);
  });

});