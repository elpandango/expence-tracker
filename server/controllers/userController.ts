import sharp from 'sharp';
import {UserModel} from "~/server/models/UserModel";
import {createError} from 'h3';

const optimizeImage = async (base64Image: string): Promise<string> => {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const optimizedBuffer = await sharp(buffer)
    .resize(150, 150, { fit: 'cover' })
    .jpeg({ quality: 60 })
    .toBuffer();

  return `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
};

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
    const optimizedAvatar = await optimizeImage(avatarBase64);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {$set: {avatar: optimizedAvatar}},
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