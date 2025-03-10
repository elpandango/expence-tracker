import type { Types, Document } from 'mongoose';
import mongoose, {Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    lastName: string;
    avatar?: string;
    cards?: Types.ObjectId[];
    cashBalances?: Types.ObjectId[];
    _id?: Types.ObjectId;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
    cashBalances: [{ type: Schema.Types.ObjectId, ref: 'CashBalance' }],
});

export const UserModel = mongoose.model<IUser>('User', userSchema);