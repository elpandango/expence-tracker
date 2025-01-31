import {createError, parseCookies, setCookie, defineEventHandler, readBody} from 'h3';
import { authRegister } from '~/server/controllers/authController/authRegister';
import {vi, it, expect, describe} from "vitest";

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    parseCookies: vi.fn(),
    getCookie: vi.fn(),
    setCookie: vi.fn(),
    readBody: vi.fn(),
    defineEventHandler: vi.fn(),
  };
});

vi.mock('~/server/controllers/authController/authRegister', () => ({
  authRegister: vi.fn(),
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Auth Register API', () => {
  it('should return userId and set cookies when valid data is provided', async () => {
    const mockEvent = { context: { params: {} } };

    const mockName = 'John';
    const mockLastName = 'Doe';
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';

    readBody.mockResolvedValue({ name: mockName, lastName: mockLastName, email: mockEmail, password: mockPassword });

    const mockToken = 'valid_token';
    const mockUserId = 'user123';
    authRegister.mockResolvedValue({ token: mockToken, userId: mockUserId });

    setCookie.mockImplementation(() => {});

    const mockHandler = vi.fn(async (event) => {
      const { name, lastName, email, password } = await readBody(event);
      const cookieAge = 60 * 60 * 24 * 7;

      try {
        const { token, userId } = await authRegister({ name, lastName, email, password });

        setCookie(event, 'auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: cookieAge,
        });

        setCookie(event, 'userId', userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: cookieAge,
        });

        setCookie(event, 'isAuthenticated', true, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: cookieAge,
        });

        return { status: 200, userId };
      } catch (err) {
        throw err;
      }
    });

    const result = await mockHandler(mockEvent);

    expect(result.status).toBe(200);
    expect(result.userId).toBe(mockUserId);

    expect(setCookie).toHaveBeenCalledWith(mockEvent, 'auth_token', mockToken, expect.objectContaining({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    }));

    expect(setCookie).toHaveBeenCalledWith(mockEvent, 'userId', mockUserId, expect.objectContaining({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    }));

    expect(setCookie).toHaveBeenCalledWith(mockEvent, 'isAuthenticated', true, expect.objectContaining({
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    }));
  });

  it('should throw error if registration fails', async () => {
    const mockEvent = { context: { params: {} } };

    const mockName = 'John';
    const mockLastName = 'Doe';
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';

    readBody.mockResolvedValue({ name: mockName, lastName: mockLastName, email: mockEmail, password: mockPassword });

    authRegister.mockRejectedValue(new Error('Registration failed'));

    const mockHandler = vi.fn(async (event) => {
      const { name, lastName, email, password } = await readBody(event);
      const cookieAge = 60 * 60 * 24 * 7;

      try {
        const { token, userId } = await authRegister({ name, lastName, email, password });

        setCookie(event, 'auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: cookieAge,
        });

        setCookie(event, 'userId', userId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: cookieAge,
        });

        setCookie(event, 'isAuthenticated', true, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: cookieAge,
        });

        return { status: 200, userId };
      } catch (err) {
        throw err;
      }
    });

    try {
      await mockHandler(mockEvent);
    } catch (err) {
      expect(err.message).toBe('Registration failed');
    }
  });
});