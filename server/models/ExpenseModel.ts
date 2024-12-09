import mongoose, {Schema, Types, Document} from 'mongoose';
import {UserModel} from "~/server/models/UserModel";
import {CardModel} from "~/server/models/CardModel";
import {CategoryModel} from "~/server/models/CategoryModel";

export interface IExpense extends Document {
  userId: Types.ObjectId;
  cardId?: Types.ObjectId;
  amount: number;
  description: string;
  date: Date;
  category?: Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>({
  userId: {type: Schema.Types.ObjectId, ref: UserModel.modelName, required: true},
  cardId: {type: Schema.Types.ObjectId, ref: CardModel.modelName, required: false},
  description: {type: String, required: true},
  amount: {type: Number, required: [true, 'Amount is required'], min: [0, 'Amount cannot be negative']},
  date: {type: Date, default: Date.now, required: true},
  category: {type: Schema.Types.ObjectId, ref: CategoryModel.modelName, default: 'Other'},
});

expenseSchema.index({userId: 1, cardId: 1});

export const ExpenseModel = mongoose.model<IExpense>('Expense', expenseSchema);