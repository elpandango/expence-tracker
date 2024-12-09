import mongoose, { Schema, Document, Types } from 'mongoose';
import {UserModel} from "~/server/models/UserModel";

export interface ICashDeposit extends Document {
  userId: Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  currency: string;
}

const cashDepositSchema = new Schema<ICashDeposit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: UserModel.modelName, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    currency: { type: String, required: true, default: 'USD' },
  },
  {
    timestamps: true,
  }
);

export const CashDepositModel = mongoose.model<ICashDeposit>('CashDeposit', cashDepositSchema);
