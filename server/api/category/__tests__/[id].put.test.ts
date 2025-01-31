import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/category/[id].put';
import {CategoryModel} from '~/server/models/CategoryModel';
import {readBody, getCookie} from 'h3';

vi.mock('~/server/models/CategoryModel', () => ({
  CategoryModel: {
    findByIdAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
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

describe('PUT /categories API', () => {
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

  it('should return 400 if category name is not provided', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({name: ''});
    const mockEvent = {context: {params: {id: '123'}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 400, message: 'Category name is required and must be a string'})
    );
  });

  it('should return 200 if category is updated successfully', async () => {
    getCookie.mockReturnValue('user123');
    const mockCategory = {_id: '123', name: 'Health', icon: '🍏'};
    CategoryModel.findByIdAndUpdate.mockResolvedValue(mockCategory);

    const mockEvent = {context: {params: {id: '123'}}};
    readBody.mockResolvedValue({name: 'Health', icon: '🍏'});

    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 200,
      message: 'Category updated successfully',
      category: mockCategory,
    });
  });

  it('should return 404 if category is not found', async () => {
    getCookie.mockReturnValue('user123');
    CategoryModel.findByIdAndUpdate.mockResolvedValue(null);

    const mockEvent = { context: { params: { id: '123' } } };
    readBody.mockResolvedValue({name: 'Health'});

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 404, message: 'Category not found' })
    );
  });
});