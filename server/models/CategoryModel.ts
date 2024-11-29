import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon?: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  icon: { type: String, default: '' },
  color: { type: String, required: true }
});

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);
