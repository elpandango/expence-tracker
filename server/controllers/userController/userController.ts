import {UserModel} from "~/server/models/userModel";
import {createError} from 'h3';

export const updateProfile = async (
  userId: string,
  updateData: Partial<{ name: string; lastName: string; email: string }>
) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {$set: updateData},
      {new: true}
    );

    if (!updatedUser) {
      throw createError({statusCode: 404, message: 'User not found.'});
    }

    return updatedUser;
  } catch (err) {
    console.error('Error updating user:', err);
    throw createError({statusCode: 500, message: 'Failed to update profile.'});
  }
};

export const updateAvatar = async (userId: string, avatarBase64: string) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {$set: {avatar: avatarBase64}},
      {new: true}
    );

    if (!updatedUser) {
      throw createError({statusCode: 404, message: 'A user with this email could not be found.'});
    }

    return updatedUser;
  } catch (err) {
    console.error(err);
    throw createError({statusCode: 404, message: 'Failed to update avatar.'});
  }
};

export const deleteAvatar = async (userId: string) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {$unset: {avatar: ""}},
      {new: true}
    );

    if (!updatedUser) {
      throw createError({statusCode: 404, message: 'A user with this email could not be found.'});
    }

    return updatedUser;
  } catch (err) {
    console.error(err);
    throw createError({statusCode: 404, message: 'Failed to delete avatar.'});
  }
};