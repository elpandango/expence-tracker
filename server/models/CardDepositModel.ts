import mongoose, { Schema, Document, Types } from 'mongoose';
import {CardModel} from "~/server/models/CardModel";
import {UserModel} from "~/server/models/UserModel";

export interface ICardDeposit extends Document {
  userId: Types.ObjectId;
  cardId: Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  currency: string;
}

const cardDepositSchema = new Schema<ICardDeposit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: UserModel.modelName, required: true },
    cardId: { type: Schema.Types.ObjectId, ref: CardModel.modelName, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    currency: { type: String, required: true, default: 'USD' },
  },
  {
    timestamps: true,
  }
);

export const CardDepositModel = mongoose.model<ICardDeposit>('CardDeposit', cardDepositSchema);
