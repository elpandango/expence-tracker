import {UserModel} from "~/server/models/userModel";
import {CustomError} from "~/server/interfaces/error";

export const getCurrentUser = async (query: string) => {
    const user = await UserModel.findOne({email: query?.email});
    if (user) {
        return {
            status: 200,
            message: 'User successfully fetched.',
            user: user
        };
    }
    const error: CustomError = new Error('Internal server error.');
    error.statusCode = 500;
    return error;
};