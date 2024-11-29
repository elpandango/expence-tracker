import {CategoryModel} from '~/server/models/CategoryModel';

export default defineEventHandler(async (event) => {
  const categories = await CategoryModel.find().select('name icon color _id');
  return {status: 200,  message: 'Expense categories retrieved successfully', categories};
});
