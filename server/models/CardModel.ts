console.log('Importing CardModel...');

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICard extends Document {
    userId: Types.ObjectId;
    name: string;
    number?: string;
    balance?: number;
    currency: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const cardSchema = new Schema<ICard>(
  {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      number: { type: String, unique: true, sparse: true },
      balance: { type: Number, required: true, default: 0 },
      currency: { type: String, required: true, default: 'USD' },
  },
  {
      timestamps: true,
  }
);

export const CardModel = mongoose.models.Card || mongoose.model<ICard>('Card', cardSchema);
