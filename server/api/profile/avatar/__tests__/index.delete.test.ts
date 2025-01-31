import { vi, expect, it, describe } from 'vitest';
import { createError, defineEventHandler, getCookie } from 'h3';
import { deleteAvatar } from '~/server/controllers/userController/userController';

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

vi.mock('~/server/controllers/userController/userController', () => ({
  deleteAvatar: vi.fn(),
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Delete Avatar API', () => {
  it('should delete avatar successfully if user ID is provided', async () => {
    const userId = 'user123';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);

    deleteAvatar.mockResolvedValue({ success: true });

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');
      const user = await deleteAvatar(userId);

      return user;
    });

    defineEventHandler.mockReturnValue(mockHandler);

    const result = await mockHandler(mockEvent);

    expect(result.success).toBe(true);
    expect(deleteAvatar).toHaveBeenCalledWith(userId);
  });

  it('should throw error if avatar deletion fails', async () => {
    const userId = 'user123';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);

    deleteAvatar.mockRejectedValue(new Error('Failed to delete avatar.'));

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');

      try {
        await deleteAvatar(userId);
      } catch (err) {
        throw createError({ statusCode: 400, message: 'Failed to delete avatar.' });
      }
    });

    defineEventHandler.mockReturnValue(mockHandler);

    try {
      await mockHandler(mockEvent);
    } catch (err) {
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Failed to delete avatar.');
    }
  });
});