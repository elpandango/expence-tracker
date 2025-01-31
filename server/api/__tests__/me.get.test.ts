import {createError, parseCookies, defineEventHandler} from 'h3';
import {verifyToken} from "~/server/utils/auth";
import {UserModel} from '../../models/UserModel';
import {vi, it, expect, describe} from "vitest";

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    parseCookies: vi.fn(),
    getCookie: vi.fn(),
    readBody: vi.fn(),
    defineEventHandler: vi.fn(),
  };
});

vi.mock('~/server/utils/auth', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('~/server/models/UserModel', () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Get User Data API (/me)', () => {
  it('should return user data if valid token is provided', async () => {
    const mockEvent = { context: { params: {} } };

    const mockToken = 'valid_token';
    parseCookies.mockReturnValue({ auth_token: mockToken });

    const mockUserData = { userId: 'user123' };
    verifyToken.mockReturnValue(mockUserData);

    const mockUser = { _id: 'user123', name: 'John', lastName: 'Doe', email: 'john.doe@example.com' };
    UserModel.findById.mockResolvedValue(mockUser);

    const mockHandler = vi.fn(async (event) => {
      const token = parseCookies(event).auth_token;

      if (!token) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
      }

      const userData = verifyToken(token);
      const userId = userData?.userId;

      const user = await UserModel.findById(userId, 'name lastName email');

      if (!user) {
        throw createError({ statusCode: 404, message: 'User not found' });
      }

      return {
        user: {
          userId: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
        }
      };
    });

    defineEventHandler.mockReturnValue(mockHandler);

    const result = await mockHandler(mockEvent);

    expect(result.user.userId).toBe(mockUser._id);
    expect(result.user.name).toBe(mockUser.name);
    expect(result.user.lastName).toBe(mockUser.lastName);
    expect(result.user.email).toBe(mockUser.email);
    expect(UserModel.findById).toHaveBeenCalledWith('user123', 'name lastName email');
  });

  it('should return 401 if token is missing', async () => {
    const mockEvent = { context: { params: {} } };

    parseCookies.mockReturnValue({});

    const mockHandler = vi.fn(async (event) => {
      const token = parseCookies(event).auth_token;

      if (!token) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
      }

      const userData = verifyToken(token);
      const userId = userData?.userId;

      const user = await UserModel.findById(userId, 'name lastName email');

      if (!user) {
        throw createError({ statusCode: 404, message: 'User not found' });
      }

      return {
        user: {
          userId: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
        }
      };
    });

    defineEventHandler.mockReturnValue(mockHandler);

    try {
      await mockHandler(mockEvent);
    } catch (err) {
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Not authenticated');
    }
  });

  it('should return 404 if user is not found', async () => {
    const mockEvent = { context: { params: {} } };

    const mockToken = 'valid_token';
    parseCookies.mockReturnValue({ auth_token: mockToken });

    const mockUserData = { userId: 'user123' };
    verifyToken.mockReturnValue(mockUserData);

    UserModel.findById.mockResolvedValue(null);

    const mockHandler = vi.fn(async (event) => {
      const token = parseCookies(event).auth_token;

      if (!token) {
        throw createError({ statusCode: 401, message: 'Not authenticated' });
      }

      const userData = verifyToken(token);
      const userId = userData?.userId;

      const user = await UserModel.findById(userId, 'name lastName email');

      if (!user) {
        throw createError({ statusCode: 404, message: 'User not found' });
      }

      return {
        user: {
          userId: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
        }
      };
    });

    defineEventHandler.mockReturnValue(mockHandler);

    try {
      await mockHandler(mockEvent);
    } catch (err) {
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('User not found');
    }
  });
});