import { CategoryModel } from '~/server/models/CategoryModel';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const body = await readBody(event);

  const updatedCategory = await CategoryModel.findByIdAndUpdate(id, {
    name: body.name,
    icon: body.icon ?? ''
  }, { new: true });

  if (!updatedCategory) {
    throw createError({ statusCode: 404, message: 'Category not found' });
  }

  return { status: 200, message: 'Category updated successfully', category: updatedCategory };
});
