import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { UserModel } from "~/server/models/UserModel";
import { createError } from 'h3';

interface AuthLoginParams {
  email: string;
  password: string;
}

interface AuthRegisterParams {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthRegisterResponse {
  status: number;
  token?: string;
  userId?: string;
  message?: string;
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

export const authRegister = async ({ name, lastName, email, password }: AuthRegisterParams): Promise<AuthRegisterResponse> => {
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return {
        status: 409,
        message: 'A user with this email already exists.'
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserModel({
      name,
      lastName,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    const token: string = jwt.sign(
      {
        email: savedUser.email,
        userId: savedUser._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '1y' }
    );

    return {
      status: 201,
      token,
      userId: savedUser._id.toString()
    };
  } catch (err) {
    console.error('Internal server error: ', err);
    return {
      status: 500,
      message: 'Internal server error.'
    };
  }
};