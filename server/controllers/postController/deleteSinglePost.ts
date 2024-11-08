import {PostModel} from "~/server/models/postModel";
import {CustomError} from "~/server/interfaces/error";

export const deleteSinglePost = async (postId: string) => {
    try {
        const post = await PostModel.findById(postId);
        await PostModel.findByIdAndDelete(post);

        return {
            status: 200,
            message: 'Post deleted.',
        };
    } catch (err: any) {
        console.log('error: ', err);
        const error: CustomError = new Error('Internal server error.');
        error.statusCode = 500;
        return error;
    }
};