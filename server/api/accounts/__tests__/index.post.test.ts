import {beforeEach, describe, expect, it, vi} from 'vitest';
import handler from '~/server/api/accounts/index.post';
import {AccountModel} from '~/server/models/AccountModel';
import {getCookie, readBody} from 'h3';

vi.mock('~/server/models/AccountModel', () => ({
  AccountModel: vi.fn().mockImplementation(() => ({
    save: vi.fn().mockResolvedValue({}),
  })),
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

describe('POST /accounts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if userId cookie is missing', async () => {
    getCookie.mockReturnValue(undefined);

    const mockEvent = {};
    const result = handler(mockEvent);
    await expect(result).rejects.toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });

    expect(getCookie).toHaveBeenCalledWith(mockEvent, 'userId');
  });

  it('should return 400 if required fields are missing', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({});

    const mockEvent = {};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Missing required fields',
    });

    expect(readBody).toHaveBeenCalledWith(mockEvent);
  });

  it('should create a new account successfully', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      name: 'My Account',
      type: 'card',
      currency: 'USD',
      cardNumber: '1234567812345678',
      initialBalance: 100,
    });

    AccountModel.prototype.save = vi.fn().mockResolvedValue({});

    const mockEvent = {};
    const result = await handler(mockEvent);

    expect(result.status).toBe(201);
    expect(result.message).toBe('Account created successfully');
  });

  it('should throw an error if type not card or cash', async() => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      name: 'My Account',
      type: 'invalid',
      currency: 'USD',
      cardNumber: '1234567812345678',
      initialBalance: 100,
    });

    const mockEvent = {};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Invalid account type',
    });

    expect(readBody).toHaveBeenCalledWith(mockEvent);
  });

  it('should throw an error if type card and no car number provided', async() => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      name: 'My Account',
      type: 'card',
      currency: 'USD',
      cardNumber: null,
      initialBalance: 100,
    });

    const mockEvent = {};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Card number is required for card accounts',
    });

    expect(readBody).toHaveBeenCalledWith(mockEvent);
  });

  it('should throw an error if balance amount < 0', async() => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      name: 'My Account',
      type: 'cash',
      currency: 'USD',
      initialBalance: -10,
    });

    const mockEvent = {};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Invalid initial balance',
    });

    expect(readBody).toHaveBeenCalledWith(mockEvent);
  });

  it('should throw an error if balance not of type number', async() => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({
      name: 'My Account',
      type: 'cash',
      currency: 'USD',
      initialBalance: '10',
    });

    const mockEvent = {};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Invalid initial balance',
    });

    expect(readBody).toHaveBeenCalledWith(mockEvent);
  });
});
