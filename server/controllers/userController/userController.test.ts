import { describe, it, expect, vi } from 'vitest';
import { updateProfile, updateAvatar, deleteAvatar } from '~/server/controllers/userController/userController';
import {getCookie} from "h3";
import { UserModel } from '~/server/models/UserModel';
import handler from "~/server/api/category/[id].put";
import sharp from 'sharp';

vi.mock('~/server/models/UserModel', () => ({
  UserModel: {
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('sharp', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('optimized-image')),
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

describe('updateProfile', () => {
  it('should return 401 if user is not authorized', async () => {
    getCookie.mockReturnValue(null);
    const mockEvent = {context: {params: {id: '123'}}};

    await expect(handler(mockEvent)).rejects.toThrowError(
      expect.objectContaining({statusCode: 401, message: 'Unauthorized'})
    );
  });

  it('should update user profile successfully', async () => {
    const mockUserId = '123';
    const mockUpdateData = { name: 'John', email: 'john@example.com' };
    const mockUpdatedUser = { _id: mockUserId, ...mockUpdateData };

    UserModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

    const result = await updateProfile(mockUserId, mockUpdateData);

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockUserId,
      { $set: mockUpdateData },
      { new: true }
    );
    expect(result).toEqual(mockUpdatedUser);
  });

  it('should throw error if user is not found', async () => {
    UserModel.findByIdAndUpdate.mockResolvedValue(null);

    await expect(updateProfile('nonexistent-id', {})).rejects.toThrow('Failed to update profile.');
  });

  it('should handle database errors', async () => {
    UserModel.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

    await expect(updateProfile('123', {})).rejects.toThrow('Failed to update profile.');
  });
});

describe('updateAvatar', () => {
  it('should update avatar successfully', async () => {
    const mockUserId = '123';
    const mockBase64 = 'data:image/png;base64,example';
    const mockUpdatedUser = { _id: mockUserId, avatar: 'optimized-avatar' };

    UserModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

    const result = await updateAvatar(mockUserId, mockBase64);

    expect(sharp).toHaveBeenCalled();
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockUserId,
      { $set: { avatar: expect.any(String) } },
      { new: true }
    );
    expect(result).toEqual(mockUpdatedUser);
  });

  it('should handle sharp errors', async () => {
    vi.mocked(sharp).mockImplementation(() => {
      throw new Error('Sharp error');
    });

    await expect(updateAvatar('123', 'mockBase64')).rejects.toThrow('Failed to update avatar.');
  });
});

describe('deleteAvatar', () => {
  it('should delete avatar successfully', async () => {
    const mockUserId = '123';
    const mockUpdatedUser = { _id: mockUserId };

    UserModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

    const result = await deleteAvatar(mockUserId);

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockUserId,
      { $unset: { avatar: '' } },
      { new: true }
    );
    expect(result).toEqual(mockUpdatedUser);
  });

  it('should handle database errors', async () => {
    UserModel.findByIdAndUpdate.mockRejectedValue(new Error('DB error'));

    await expect(deleteAvatar('123')).rejects.toThrow('Failed to delete avatar.');
  });
});