import mongoose from 'mongoose';
import {UserModel} from "~/server/models/UserModel";

const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel.modelName, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['card', 'cash', 'savings'],
    required: true
  },
  currency: { type: String, required: true, default: 'EUR' },
  balance: { type: Number, default: 0 },
  cardNumber: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const AccountModel = mongoose.model('Account', AccountSchema);
