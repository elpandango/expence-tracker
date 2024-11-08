import {getAllPosts} from "~/server/controllers/postController/getAllPosts";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    // const currentPage: number = +(event?.context?.params?.page) || 1;
    const currentPage: number = +(query?.page) || 1;
    const perPage: number = 9;
    return await getAllPosts(query.query, currentPage, perPage);
});