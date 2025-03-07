import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/category/[id].delete';
import {CategoryModel} from '~/server/models/CategoryModel';
import {getCookie} from 'h3';

vi.mock('~/server/models/CategoryModel', () => ({
  CategoryModel: {
    findOneAndDelete: vi.fn(),
    save: vi.fn()
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

vi.mock('~/server/utils/redis', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue('OK'),
  },
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('DELETE /categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if no ID is provided', async () => {
    const mockEvent = {context: {params: {}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 400, message: 'Category ID is required'})
    );
  });

  it('should return 401 if user is not authorized', async () => {
    getCookie.mockReturnValue(null);
    const mockEvent = {context: {params: {id: '123'}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 401, message: 'Unauthorized'})
    );
  });

  it('should return 404 if category is not found', async () => {
    getCookie.mockReturnValue('user123');
    CategoryModel.findOneAndDelete.mockResolvedValue(null);

    const mockEvent = {context: {params: {id: '123'}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 404, message: 'Category not found'})
    );
  });

  it('should delete the category and return 200 if successful', async () => {
    getCookie.mockReturnValue('user123');
    const mockCategory = { _id: '123', name: 'Test Category', userId: 'user123' };
    CategoryModel.findOneAndDelete.mockResolvedValue(mockCategory);

    const mockEvent = {context: {params: {id: '123'}}};

    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 200,
      message: 'Category deleted successfully',
    });

    expect(CategoryModel.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: 'user123' });
  });
});