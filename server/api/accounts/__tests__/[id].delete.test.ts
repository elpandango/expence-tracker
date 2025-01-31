import {describe, it, expect, vi, beforeEach} from 'vitest';
import handler from '~/server/api/accounts/[id].delete';
import {AccountModel} from '~/server/models/AccountModel';
import {TransactionModel} from '~/server/models/TransactionModel';
import {getCookie} from 'h3';

vi.mock('~/server/models/AccountModel', () => ({
  AccountModel: {
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('~/server/models/TransactionModel', () => ({
  TransactionModel: {
    find: vi.fn(),
    deleteMany: vi.fn(),
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

describe('DELETE /accounts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authorized', async () => {
    getCookie.mockReturnValue(undefined);
    const mockEvent = {context: {params: {id: 'account123'}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 401, message: 'Unauthorized'})
    );
  });

  it('should return 400 if account ID is not provided', async () => {
    getCookie.mockReturnValue('user123');

    const mockEvent = {context: {params: {}}};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 400,
      message: 'Account ID is required',
    });
  });

  it('should return 404 if account is not found', async () => {
    getCookie.mockReturnValue('user123');
    AccountModel.findOne.mockResolvedValue(null);

    const mockEvent = {context: {params: {id: 'account123'}}};
    const result = handler(mockEvent);

    await expect(result).rejects.toEqual({
      statusCode: 404,
      message: 'Account not found',
    });

    expect(AccountModel.findOne).toHaveBeenCalledWith({
      _id: 'account123',
      userId: 'user123',
    });
  });

  it('should delete associated transactions and the account', async () => {
    getCookie.mockReturnValue('user123');
    AccountModel.findOne.mockResolvedValue({id: 'account123', userId: 'user123'});
    TransactionModel.find.mockResolvedValue([{id: 'tx1'}, {id: 'tx2'}]);

    const mockEvent = {context: {params: {id: 'account123'}}};
    const result = await handler(mockEvent);

    expect(TransactionModel.deleteMany).toHaveBeenCalledWith({accountId: 'account123'});
    expect(AccountModel.deleteOne).toHaveBeenCalledWith({_id: 'account123'});
    expect(result).toEqual({
      status: 200,
      message: 'Account and associated transactions deleted successfully',
    });
  });

  it('should delete the account if no associated transactions exist', async () => {
    getCookie.mockReturnValue('user123');
    AccountModel.findOne.mockResolvedValue({id: 'account123', userId: 'user123'});
    TransactionModel.find.mockResolvedValue([]);

    const mockEvent = {context: {params: {id: 'account123'}}};
    const result = await handler(mockEvent);

    expect(TransactionModel.deleteMany).not.toHaveBeenCalled();
    expect(AccountModel.deleteOne).toHaveBeenCalledWith({_id: 'account123'});
    expect(result).toEqual({
      status: 200,
      message: 'Account and associated transactions deleted successfully',
    });
  });

});