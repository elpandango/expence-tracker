import {describe, it, expect, vi, beforeEach} from 'vitest';
import handler from '~/server/api/accounts/[id].put';
import {AccountModel} from '~/server/models/AccountModel';
import {getCookie, readBody} from 'h3';

vi.mock('~/server/models/AccountModel', () => ({
  AccountModel: {
    findOne: vi.fn(),
    save: vi.fn()
  },
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

describe('PUT /accounts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if userId cookie is missing', async () => {
    getCookie.mockReturnValue(undefined);

    const mockEvent = {context: {params: {id: null}}};
    const result = handler(mockEvent);
    await expect(result).rejects.toEqual({
      statusCode: 401,
      message: 'Unauthorized',
    });

    expect(getCookie).toHaveBeenCalledWith(mockEvent, 'userId');
  });

  it('should return 400 if account ID is missing', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({name: 'New Account', currency: 'USD'});

    const mockEvent = {context: {params: {id: null}}};
    const result = handler(mockEvent);
    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Account ID is required',
    });
  });

  it('should return 404 if account not found', async () => {
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({name: 'New Account', currency: 'USD'});

    const mockEvent = {context: {params: {id: 'nonexistent-id'}}};
    AccountModel.findOne.mockResolvedValue(null);
    const result = handler(mockEvent);
    await expect(result).rejects.toEqual({
      statusCode: 404,
      message: 'Account not found',
    });
  });

  it('should update account and return success message', async () => {
    const mockAccount = {_id: 'account123', userId: 'user123', name: 'Old Account', currency: 'USD', save: vi.fn()};
    getCookie.mockReturnValue('user123');
    readBody.mockResolvedValue({name: 'Updated Account', currency: 'USD'});
    AccountModel.findOne.mockResolvedValue(mockAccount);

    const mockEvent = {context: {params: {id: 'account123'}}};
    const result = await handler(mockEvent);

    expect(result).toEqual({
      status: 200,
      message: 'Account updated successfully',
      account: { ...mockAccount, name: 'Updated Account', currency: 'USD' },
    });

  });
});
