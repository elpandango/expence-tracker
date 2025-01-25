import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '~/server/api/accounts/index.post';
import { AccountModel } from '~/server/models/AccountModel';
import { getCookie, readBody } from 'h3';

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

describe('Account creation API', () => {
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

  it('should return 400 if required fields are missing', async() => {
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

    // Замокаем метод save
    const saveMock = vi.fn().mockResolvedValue({});
    AccountModel.prototype.save = saveMock;

    const mockEvent = {};

    // Добавим логирование в обработчик, чтобы понять, что происходит
    const result = await handler(mockEvent);

    console.log('result: ', result);  // Печать результата для отладки
    console.log('saveMock call count: ', saveMock.mock.calls.length); // Количество вызовов save

    // Проверяем статус и сообщение
    expect(result.status).toBe(201);
    expect(result.message).toBe('Account created successfully');

    // Проверяем, что save был вызван
    expect(saveMock).toHaveBeenCalledTimes(1);  // Проверяем, был ли вызван save
  });



});
