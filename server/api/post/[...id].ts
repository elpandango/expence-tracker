import {getSinglePost} from "~/server/controllers/postController/getSinglePost";
import {deleteSinglePost} from "~/server/controllers/postController/deleteSinglePost";

export default defineEventHandler(async (event) => {
    const postId: string | undefined = event?.context?.params?.id || '';

    if (event._method === 'GET') {
        return await getSinglePost(postId);
    }

    if (event._method === 'DELETE') {
        return await deleteSinglePost(postId);
    }
});