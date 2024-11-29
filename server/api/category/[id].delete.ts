import {CategoryModel} from '~/server/models/CategoryModel';

export default defineEventHandler(async (event) => {
  const {id} = event.context.params;

  const deletedCategory = await CategoryModel.findByIdAndDelete(id);

  if (!deletedCategory) {
    throw createError({statusCode: 404, message: 'Category not found'});
  }

  return {status: 200, message: 'Category deleted successfully'};
});
