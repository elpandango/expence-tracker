import {PostModel} from "~/server/models/postModel";
import {CustomError} from "~/server/interfaces/error";

export const getSinglePost = async (postId: string) => {
    try {
        const post = await PostModel.findById(postId);

        return {
            status: 200,
            message: 'Post fetched.',
            post: post
        };
    } catch (err: any) {
        console.log('error: ', err);
        const error: CustomError = new Error('Internal server error.');
        error.statusCode = 500;
        return error;
    }
};