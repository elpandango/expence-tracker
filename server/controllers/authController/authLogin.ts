import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { UserModel } from "~/server/models/UserModel";
import { createError } from 'h3';

interface AuthLoginParams {
  email: string;
  password: string;
}

export const authLogin = async ({ email, password }: AuthLoginParams) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createError({ statusCode: 404, message: 'A user with this email could not be found.' });
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createError({ statusCode: 401, message: 'Wrong password!' });
  }

  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id.toString(),
    },
    'somesupersecretsecret',
    { expiresIn: '1y' }
  );

  return {
    token,
    userId: user._id.toString(),
  };
};
