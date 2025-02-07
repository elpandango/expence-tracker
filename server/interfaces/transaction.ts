import type { ObjectId } from 'mongoose';

export interface ITransaction {
  userId: ObjectId;
  accountId: ObjectId;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  date: Date;
  relatedAccountId: ObjectId | null;
  category: ObjectId | null;
}
