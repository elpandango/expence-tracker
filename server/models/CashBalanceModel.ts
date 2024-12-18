import mongoose, { Schema, Document, Types } from 'mongoose';
import {UserModel} from "~/server/models/UserModel";

export interface ICashBalance extends Document {
    userId: Types.ObjectId;
    currency: string;
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const cashSchema = new Schema<ICashBalance>(
  {
      userId: { type: Schema.Types.ObjectId, ref: UserModel.modelName, required: true },
      currency: { type: String, required: true, default: 'USD' },
      amount: { type: Number, required: true, default: 0 },
  },
  {
      timestamps: true,
  }
);

export const CashBalanceModel = mongoose.model<ICashBalance>('CashBalance', cashSchema);
