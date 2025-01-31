import {describe, it, expect, vi, beforeEach} from 'vitest';
import handler from '~/server/api/accounts/index.get';
import {AccountModel} from '~/server/models/AccountModel';
import {getCookie} from 'h3';

vi.mock('~/server/models/AccountModel', () => ({
  AccountModel: {
    find: vi.fn(),
  },
}));

vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal();
  return {
    ...actualH3,
    getCookie: vi.fn(),
  };
});

vi.stubGlobal('createError', vi.fn((error) => error));

describe('GET /accounts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 500 if there is a problem with database', async () => {
    getCookie.mockReturnValue('user123');
    AccountModel.find.mockRejectedValue(new TypeError('Database error'));

    const mockEvent = {};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 500,
      message: 'Failed to fetch accounts',
      data: new TypeError('Database error'),
    });

    expect(getCookie).toHaveBeenCalledWith(mockEvent, 'userId');
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

  it('should return status 200 and a list of accounts if userId cookie is valid', async () => {
    getCookie.mockReturnValue('user123');
    const mockAccounts = [
      { id: 'account1', name: 'Savings', balance: 1000 },
      { id: 'account2', name: 'Checking', balance: 500 },
    ];
    AccountModel.find.mockResolvedValue(mockAccounts);

    const mockEvent = {};
    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 200,
      accounts: mockAccounts,
    });

    expect(getCookie).toHaveBeenCalledWith(mockEvent, 'userId');
    expect(AccountModel.find).toHaveBeenCalledWith({ userId: 'user123' });
  });
});