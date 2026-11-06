import mongoose from 'mongoose';
import type {SavedPlanEntry, SavingsPlanPayload} from '~/types/savingsPlan';

type StoredEntry = Omit<SavedPlanEntry, 'accountId'> & {accountId?: mongoose.Types.ObjectId | null};
type SavingsPlanDocument = Omit<SavingsPlanPayload, 'defaultAccountId' | 'incomes' | 'expenses'> & {
  defaultAccountId?: mongoose.Types.ObjectId | null;
  incomes: StoredEntry[];
  expenses: StoredEntry[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const EntrySchema = new mongoose.Schema({
  id: {type: Number, required: true, min: 0, validate: Number.isSafeInteger},
  name: {type: String, required: true, trim: true, maxlength: 100},
  amountCents: {type: Number, required: true, min: 0, max: 100_000_000_000, validate: Number.isSafeInteger},
  startMonth: {type: String, default: null},
  endMonth: {type: String, default: null},
  accountId: {type: mongoose.Schema.Types.ObjectId, default: null},
}, {_id: false});

const SavingsPlanSchema = new mongoose.Schema<SavingsPlanDocument>({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, immutable: true},
  defaultAccountId: {type: mongoose.Schema.Types.ObjectId, default: null},
  startMonth: {type: String, required: true},
  endMonth: {type: String, required: true},
  incomes: {type: [EntrySchema], default: []},
  expenses: {type: [EntrySchema], default: []},
}, {timestamps: true});

// The authenticated user's ID is also the document ID: one plan per login,
// enforced by MongoDB's built-in _id index without adding an index to existing collections.
export const SavingsPlanModel = (mongoose.models.SavingsPlan as mongoose.Model<SavingsPlanDocument> | undefined)
  || mongoose.model<SavingsPlanDocument>('SavingsPlan', SavingsPlanSchema);
