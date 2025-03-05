import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/category/index.post';
import {CategoryModel} from '~/server/models/CategoryModel';
import {readBody, getCookie} from 'h3';

vi.mock('~/server/models/CategoryModel', () => ({
  CategoryModel: vi.fn().mockImplementation(function () {}),
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

describe('POST /categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if name is missing', async () => {
    readBody.mockResolvedValue({icon: '🍔'});
    getCookie.mockReturnValue('user123');

    const mockEvent = {
      req: {headers: {}},
      context: {params: {}},
      body: {},
    };

    try {
      await handler(mockEvent);
    } catch (error) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Category name is required and must be a string');
    }
  });

  it('should set icon to an empty string if not provided', async () => {
    readBody.mockResolvedValue({name: 'Health'});
    getCookie.mockReturnValue('user123');

    CategoryModel.mockImplementation(function (data) {
      return {
        ...data,
        _id: 'mocked-id',
        save: vi.fn(),
      };
    });

    const mockEvent = {};
    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 200,
      message: 'Category added successfully',
      category: expect.objectContaining({
        name: 'Health',
        icon: '',
        id: 'mocked-id',
      }),
    });

    expect(CategoryModel).toHaveBeenCalledWith({
      name: 'Health',
      icon: '',
    });
  });

  it('should successfully add a category with name and icon', async () => {
    readBody.mockResolvedValue({name: 'Food', icon: '🍔'});
    getCookie.mockReturnValue('user123');

    CategoryModel.mockImplementation(function (data) {
      return {
        ...data,
        _id: 'mocked-id',
        save: vi.fn(),
      };
    });

    const mockEvent = {};
    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 200,
      message: 'Category added successfully',
      category: expect.objectContaining({
        name: 'Food',
        icon: '🍔',
        id: 'mocked-id',
      }),
    });

    expect(CategoryModel).toHaveBeenCalledWith({
      name: 'Food',
      icon: '🍔',
    });
  });

  it('should return 401 if user is not authorized', async () => {
    getCookie.mockReturnValue(null);
    const mockEvent = { context: { params: { id: '123' } } };

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({ statusCode: 401, message: 'Unauthorized' })
    );
  });
});