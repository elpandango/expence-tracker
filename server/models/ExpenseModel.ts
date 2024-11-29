import mongoose, {Schema, Types, Document } from 'mongoose';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  cardId?: Types.ObjectId;
  isCash?: boolean;
  amount: number;
  description: string;
  date: Date;
  category?: Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: Schema.Types.ObjectId, ref: 'User.cards', required: false },
  isCash: { type: Boolean, required: true, default: true },
  description: { type: String, required: true },
  amount: { type: Number, required: [true, 'Amount is required'], min: [0, 'Amount cannot be negative'] },
  date: { type: Date, default: Date.now, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', default: 'Other' },
});

expenseSchema.index({ userId: 1, cardId: 1 });

export const ExpenseModel = mongoose.model<IExpense>('Expense', expenseSchema);