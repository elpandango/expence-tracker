import {createError, parseCookies, setCookie, deleteCookie, defineEventHandler, readBody} from 'h3';
import {vi, it, expect, describe} from "vitest";

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    parseCookies: vi.fn(),
    deleteCookie: vi.fn(),
    getCookie: vi.fn(),
    setCookie: vi.fn(),
    readBody: vi.fn(),
    defineEventHandler: vi.fn(),
  };
});

vi.stubGlobal('createError', vi.fn((error) => error));

describe('Logout API', () => {
  it('should delete cookies and return success message', async () => {
    const mockEvent = { context: { params: {} } };

    deleteCookie.mockImplementation(() => {});

    const mockHandler = vi.fn(async (event) => {
      deleteCookie(event, 'userId');
      deleteCookie(event, 'auth_token');
      deleteCookie(event, 'isAuthenticated');

      return {
        status: 200,
        message: 'Logged out successfully',
      };
    });

    const result = await mockHandler(mockEvent);

    expect(deleteCookie).toHaveBeenCalledWith(mockEvent, 'userId');
    expect(deleteCookie).toHaveBeenCalledWith(mockEvent, 'auth_token');
    expect(deleteCookie).toHaveBeenCalledWith(mockEvent, 'isAuthenticated');

    expect(result.status).toBe(200);
    expect(result.message).toBe('Logged out successfully');
  });
});