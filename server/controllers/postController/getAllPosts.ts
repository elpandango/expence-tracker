import {PostModel} from "~/server/models/postModel";
import {CustomError} from "~/server/interfaces/error";

export const getAllPosts = async (query: string, currentPage: number, perPage: number) => {
  try {
    const totalItems: number = await PostModel.find().countDocuments();
    let posts;
    const maxContentLength = 200;

    if (query) {
      // Posts = await PostModel.find({
      //     type: query
      // })
      posts = await PostModel.find()
        .sort({createdAt: -1})
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    } else {
      posts = await PostModel.find()
        .sort({createdAt: -1})
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }

    posts = posts.map(post => ({
      ...post.toObject(),
      content: post.content.length > maxContentLength
        ? post.content.substring(0, maxContentLength) + '...'
        : post.content
    }));

    return {
      status: 200,
      posts: posts,
      totalItems: totalItems,
      currentPage: currentPage,
      hasNextPage: perPage * currentPage < totalItems,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalItems / perPage)
    }
  } catch (err) {
    console.log('error: ', err);
    const error: CustomError = new Error('Internal server error.');
    error.statusCode = 500;
    return error;
  }
};