import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import {UserModel} from "~/server/models/userModel";
import {CustomError} from "~/server/interfaces/error";

interface AuthLoginParams {
    email: string;
    password: string;
}

interface AuthLoginResponse {
    status?: number;
    token?: string;
    userId?: string;
    statusCode?: number;
}

export const authLogin = async ({email, password}: AuthLoginParams): Promise<AuthLoginResponse> => {
    let loadedUser;
    try {
        const user = await UserModel.findOne({email: email});
        if (!user) {
            const error: CustomError = new Error('A user with this email could not be found.');
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        const isEqual: boolean = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error: CustomError = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token: string = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'somesupersecretsecret'
            , {expiresIn: '1y'})
        return {
            status: 200,
            token: token,
            userId: loadedUser._id.toString()
        };
    } catch (err) {
        console.log('error: ', err);
        const error: CustomError = new Error('Internal server error.');
        error.statusCode = 500;
        return error;
    }
};