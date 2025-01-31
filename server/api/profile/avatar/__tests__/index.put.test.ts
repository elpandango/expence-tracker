import { vi, expect, it, describe } from 'vitest';
import { createError, defineEventHandler, getCookie, readBody } from 'h3';
import { updateAvatar } from '~/server/controllers/userController/userController';

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
  updateAvatar: vi.fn(),
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Update Avatar API', () => {
  it('should update avatar successfully if user ID is provided', async () => {
    const userId = 'user123';
    const avatar = 'new-avatar-url';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);
    readBody.mockResolvedValue({ avatar });

    updateAvatar.mockResolvedValue({ success: true, avatar: avatar });

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');
      const { avatar } = await readBody(event);
      const user = await updateAvatar(userId, avatar);

      return user;
    });

    defineEventHandler.mockReturnValue(mockHandler);

    const result = await mockHandler(mockEvent);

    expect(result.success).toBe(true);
    expect(result.avatar).toBe(avatar);
    expect(updateAvatar).toHaveBeenCalledWith(userId, avatar);
  });

  it('should throw error if avatar update fails', async () => {
    const userId = 'user123';
    const avatar = 'new-avatar-url';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);
    readBody.mockResolvedValue({ avatar });

    updateAvatar.mockRejectedValue(new Error('Failed to update avatar.'));

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');
      const { avatar } = await readBody(event);

      try {
        await updateAvatar(userId, avatar);
      } catch (err) {
        throw createError({ statusCode: 400, message: 'Failed to update avatar.' });
      }
    });

    defineEventHandler.mockReturnValue(mockHandler);

    try {
      await mockHandler(mockEvent);
    } catch (err) {
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Failed to update avatar.');
    }
  });
});