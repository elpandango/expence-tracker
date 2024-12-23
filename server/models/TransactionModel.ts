import mongoose from 'mongoose';
import {AccountModel} from "~/server/models/AccountModel";
import {UserModel} from "~/server/models/UserModel";
import {CategoryModel} from "~/server/models/CategoryModel";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel.modelName, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: AccountModel.modelName, required: true },
  type: {
    type: String,
    enum: ['expense', 'income', 'transfer'],
    required: true
  },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'EUR' },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  relatedAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: AccountModel.modelName,
    default: null
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: CategoryModel.modelName, default: null }
});

export const TransactionModel = mongoose.model('Transaction', TransactionSchema);
