import {authRegister} from '~/server/controllers/authController/authRegister';
import {UserModel} from '~/server/models/UserModel';
import bcrypt from 'bcryptjs';
import {vi, describe, it, expect} from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('~/server/models/UserModel');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('authRegister', () => {
  it('should register a new user successfully', async () => {
    const mockUser = {_id: '12345', name: 'John', lastName: 'Doe', email: 'john.doe@example.com'};

    UserModel.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');
    UserModel.prototype.save.mockResolvedValue(mockUser);

    const result = await authRegister({
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    expect(result.status).toBe(201);
    expect(result.userId).toBe('12345');
  });

  it('should return 409 if user with this email already exists', async () => {
    UserModel.findOne.mockResolvedValue({
      _id: '12345',
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword'
    });

    const result = await authRegister({
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    expect(result.status).toBe(409);
    expect(result.message).toBe('A user with this email already exists.');
  });

  it('should handle internal server errors', async () => {
    UserModel.findOne.mockRejectedValue(new Error('Database error'));

    const result = await authRegister({
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });

    expect(result.status).toBe(500);
    expect(result.message).toBe('Internal server error.');
  });
});