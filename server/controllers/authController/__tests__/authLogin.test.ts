import {authLogin} from '~/server/controllers/authController/authLogin';
import {UserModel} from '~/server/models/UserModel';
import bcrypt from 'bcryptjs';
import {vi, describe, it, expect} from 'vitest';

vi.mock('~/server/models/UserModel');
vi.mock('bcryptjs');

describe('authLogin', () => {
  it('should return token and userId for valid credentials', async () => {
    UserModel.findOne.mockResolvedValue({
      _id: '12345',
      email: 'test@example.com',
      password: 'hashedPassword', // assume this is a hashed password
    });

    bcrypt.compare.mockResolvedValue(true); // assume password matches

    const result = await authLogin({ email: 'test@example.com', password: 'password123' });

    expect(result.token).toBeDefined();
    expect(result.userId).toBe('12345');
  });

  it('should throw error if user is not found', async () => {
    UserModel.findOne.mockResolvedValue(null); // user not found

    await expect(authLogin({ email: 'invalid@example.com', password: 'password123' }))
      .rejects
      .toThrowError('A user with this email could not be found.');
  });

  it('should throw error if password is incorrect', async () => {
    UserModel.findOne.mockResolvedValue({
      _id: '12345',
      email: 'test@example.com',
      password: 'hashedPassword',
    });

    bcrypt.compare.mockResolvedValue(false); // password does not match

    await expect(authLogin({ email: 'test@example.com', password: 'wrongPassword' }))
      .rejects
      .toThrowError('Wrong password!');
  });
});