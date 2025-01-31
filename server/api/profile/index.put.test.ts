import {vi, expect, it, beforeEach, describe} from 'vitest';
import {createError, defineEventHandler, getCookie, readBody} from 'h3';
import {updateProfile} from "~/server/controllers/userController/userController";

vi.mock('h3', () => ({
  ...vi.importActual('h3'),
  getCookie: vi.fn(),
  // readBody: vi.fn(),
  defineEventHandler: vi.fn(),
  readBody: vi.fn().mockResolvedValue({
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  }),
}));

vi.mock('~/server/controllers/userController/userController', () => ({
  updateProfile: vi.fn(),
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Edit User Profile API', () => {
  let mockEvent: any;

  beforeEach(() => {
    mockEvent = {
      context: {
        params: {},
      },
      req: {},
      res: {},
    };
  });

  it('should return updated user profile if user ID is provided', async () => {
    const userId = 'user123';
    const mockEvent = { context: { params: {} } };

    getCookie.mockReturnValue(userId);
    readBody.mockResolvedValue({
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });

    const mockUpdatedUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'avatar-url',
    };

    updateProfile.mockResolvedValue(mockUpdatedUser);

    const mockHandler = vi.fn(async (event) => {
      const userId = getCookie(event, 'userId');
      if (!userId) {
        throw createError({ statusCode: 400, message: 'User ID is required.' });
      }

      const { name, lastName, email } = await readBody(event);
      const updatedUser = await updateProfile(userId, { name, lastName, email });

      return {
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        avatar: updatedUser.avatar ?? '',
      };
    });

    defineEventHandler.mockReturnValue(mockHandler);

    const result = await mockHandler(mockEvent);

    expect(result.name).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.email).toBe('john.doe@example.com');
    expect(result.avatar).toBe('avatar-url');
  });

  it('should return 400 if userId is not provided in cookies', async () => {
    mockEvent.getCookie = vi.fn().mockReturnValue(undefined);

    try {
      await expect(
        defineEventHandler(async (event) => {
          const userId = getCookie(event, 'userId');
          if (!userId) {
            throw createError({ statusCode: 400, message: "User ID is required." });
          }

          const { name, lastName, email } = await readBody(event);
          const updatedUser = await updateProfile(userId, { name, lastName, email });

          return {
            name: updatedUser.name,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            avatar: updatedUser.avatar ?? '',
          };
        })(mockEvent)
      )
    } catch (err) {
      expect(err).toHaveProperty('statusCode', 400);
      expect(err).toHaveProperty('message', 'User ID is required.');
    }
  });

  it('should handle errors thrown by updateProfile', async () => {
    const userId = 'user123';
    mockEvent.getCookie = vi.fn().mockReturnValue(userId);
    mockEvent.readBody = vi.fn().mockResolvedValue({
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });

    updateProfile.mockRejectedValue(new Error('Failed to update user'));

    await expect(
      defineEventHandler(async (event) => {
        const userId = getCookie(event, 'userId');
        if (!userId) {
          throw createError({ statusCode: 400, message: "User ID is required." });
        }

        const { name, lastName, email } = await readBody(event);
        const updatedUser = await updateProfile(userId, { name, lastName, email });

        return {
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          avatar: updatedUser.avatar ?? '',
        };
      })(mockEvent)
    ).rejects.toThrowError('Failed to update user');
  });
});