import mongoose, {Schema, Document} from 'mongoose';

export interface Phrase extends Document {
    author: string;
    content: string;
}

const phraseSchema = new Schema<Phrase>({
    author: {type: String, required: true},
    content: {type: String, required: true},
}, {timestamps: true});

export const PhraseModel = mongoose.model<Phrase>('Phrase', phraseSchema);