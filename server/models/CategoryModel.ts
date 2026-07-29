import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon?: string;
  color: string;
  archived: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  icon: { type: String, default: '' },
  color: { type: String, required: true },
  archived: { type: Boolean, default: false },
});

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);
