import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/charts/index.get';
import {getCookie, getQuery} from 'h3';

vi.mock('~/server/models/TransactionModel', () => ({
  TransactionModel: {
    aggregate: vi.fn().mockResolvedValue([
      { _id: 'cat1', amount: 150 },
      { _id: null, amount: 25 },
    ]),
  },
}));

vi.mock('~/server/models/CategoryModel', () => ({
  CategoryModel: {
    find: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { _id: 'cat1', name: 'Food' },
      ]),
    }),
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
    getCookie.mockReturnValue('67745325944561b4ab55f52b');
    const mockEvent = { context: { params: {} } };
    getQuery.mockReturnValue({ chartType: 'invalidType' });

    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 400,
      message: 'Invalid chart type',
    });
  });

  it('should return data for categoryTotals chartType', async() => {
    getCookie.mockReturnValue('67745325944561b4ab55f52b');
    const mockEvent = { context: { params: {} } };
    getQuery.mockReturnValue({ chartType: 'categoryTotals', startDate: '2025-01-01', endDate: '2025-01-10' });

    const result = await handler(mockEvent);

    expect(result.status).toBe(200);
    expect(result.data).toEqual([
      { category: 'Food', categoryId: 'cat1', amount: 150 },
      { category: 'Uncategorized', categoryId: null, amount: 25 },
    ]);
  });

});
