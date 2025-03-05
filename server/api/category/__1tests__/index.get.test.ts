import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/category/index.get';
import {CategoryModel} from '~/server/models/CategoryModel';
import {getCookie} from 'h3';

vi.mock('~/server/models/CategoryModel', () => ({
  CategoryModel: {
    find: vi.fn().mockResolvedValue([]),
    findOneAndDelete: vi.fn(),
    save: vi.fn(),
  },
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

describe('GET /categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authorized', async () => {
    getCookie.mockReturnValue(null);
    const mockEvent = {context: {params: {id: '123'}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 401, message: 'Unauthorized'})
    );
  });

  it('should return categories if they exist', async () => {
    getCookie.mockReturnValue('user123');

    const mockCategories = [
      { _id: '1', name: 'Food', icon: '🍎', color: '#FF0000' },
      { _id: '2', name: 'Travel', icon: '✈️', color: '#00FF00' },
    ];

    CategoryModel.find.mockResolvedValue(mockCategories);

    const mockEvent = { context: {} };
    const result = await handler(mockEvent);

    expect(result.status).toBe(200);
    expect(result.message).toBe('Expense categories retrieved successfully');
    expect(result.categories).toHaveLength(2);
  });

});
