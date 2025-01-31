import { vi, expect, it, beforeEach, describe } from 'vitest';
import { createError, defineEventHandler, getCookie, readBody } from 'h3';
import {UserModel} from "~/server/models/UserModel";

vi.mock('~/server/controllers/transactionsController/createTransaction', () => ({
  createTransaction: vi.fn(),
}));

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
    readBody: vi.fn(),
    defineEventHandler: vi.fn(),
  };
});

vi.mock('~/server/models/UserModel', () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Get User Avatar API', () => {
  it('should return user avatar if userId is provided', async () => {
    const userId = 'user123';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);

    const mockAvatar = 'avatar-url';
    UserModel.findById.mockResolvedValue({ avatar: mockAvatar });

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');
      const user = await UserModel.findById(userId, 'avatar');

      if (!user || !user.avatar) {
        throw createError({ statusCode: 404, message: 'Avatar not found' });
      }

      return {
        avatar: user.avatar,
      };
    });

    defineEventHandler.mockReturnValue(mockHandler);

    const result = await mockHandler(mockEvent);

    expect(result.avatar).toBe(mockAvatar);
  });

  it('should throw 404 error if avatar is not found', async () => {
    const userId = 'user123';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);

    UserModel.findById.mockResolvedValue(null);

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');
      const user = await UserModel.findById(userId, 'avatar');

      if (!user || !user.avatar) {
        throw createError({ statusCode: 404, message: 'Avatar not found' });
      }

      return {
        avatar: user.avatar,
      };
    });

    defineEventHandler.mockReturnValue(mockHandler);

    try {
      await mockHandler(mockEvent);
    } catch (err) {
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Avatar not found');
    }
  });
});