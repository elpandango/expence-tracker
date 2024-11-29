import { CategoryModel } from '~/server/models/CategoryModel';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const newCategory = new CategoryModel({
    name: body.name,
    icon: body.icon ?? ''
  });

  await newCategory.save();
  return { status: 200, message: 'Category added successfully', category: newCategory };
});
