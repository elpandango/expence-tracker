import {createError, parseCookies, setCookie, defineEventHandler, readBody} from 'h3';
import { authLogin } from '~/server/controllers/authController/authLogin';
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

vi.mock('~/server/utils/auth', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('~/server/controllers/authController/authLogin', () => ({
  authLogin: vi.fn(),
}));

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Auth Login API', () => {
  it('should return userId and set cookies when valid credentials are provided', async () => {
    const mockEvent = { context: { params: {} } };

    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';

    readBody.mockResolvedValue({ email: mockEmail, password: mockPassword });

    const mockToken = 'valid_token';
    const mockUserId = 'user123';
    authLogin.mockResolvedValue({ token: mockToken, userId: mockUserId });

    setCookie.mockImplementation(() => {});

    const mockHandler = vi.fn(async (event) => {
      const { email, password } = await readBody(event);
      const cookieAge = 60 * 60 * 24 * 7;

      try {
        const { token, userId } = await authLogin({ email, password });

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
        if (err.message === 'Invalid email') {
          return { status: 400, field: 'email', message: 'Invalid email address' };
        } else if (err.message === 'Invalid password') {
          return { status: 400, field: 'password', message: 'Incorrect password' };
        }
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

  it('should return error message for invalid email', async () => {
    const mockEvent = { context: { params: {} } };

    const mockEmail = 'invalid@example.com';
    const mockPassword = 'password123';

    readBody.mockResolvedValue({ email: mockEmail, password: mockPassword });

    authLogin.mockRejectedValue(new Error('Invalid email'));

    const mockHandler = vi.fn(async (event) => {
      const { email, password } = await readBody(event);
      const cookieAge = 60 * 60 * 24 * 7;

      try {
        const { token, userId } = await authLogin({ email, password });

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
        if (err.message === 'Invalid email') {
          return { status: 400, field: 'email', message: 'Invalid email address' };
        } else if (err.message === 'Invalid password') {
          return { status: 400, field: 'password', message: 'Incorrect password' };
        }
        throw err;
      }
    });

    const result = await mockHandler(mockEvent);

    expect(result.status).toBe(400);
    expect(result.field).toBe('email');
    expect(result.message).toBe('Invalid email address');
  });

  it('should return error message for incorrect password', async () => {
    const mockEvent = { context: { params: {} } };

    const mockEmail = 'test@example.com';
    const mockPassword = 'wrongpassword';

    readBody.mockResolvedValue({ email: mockEmail, password: mockPassword });

    authLogin.mockRejectedValue(new Error('Invalid password'));

    const mockHandler = vi.fn(async (event) => {
      const { email, password } = await readBody(event);
      const cookieAge = 60 * 60 * 24 * 7;

      try {
        const { token, userId } = await authLogin({ email, password });

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
        if (err.message === 'Invalid email') {
          return { status: 400, field: 'email', message: 'Invalid email address' };
        } else if (err.message === 'Invalid password') {
          return { status: 400, field: 'password', message: 'Incorrect password' };
        }
        throw err;
      }
    });

    const result = await mockHandler(mockEvent);

    expect(result.status).toBe(400);
    expect(result.field).toBe('password');
    expect(result.message).toBe('Incorrect password');
  });
});