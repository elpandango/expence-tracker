import mongoose, {Schema, Document} from 'mongoose';

export interface Component extends Document {
    title: string;
    code: string;
    type: string;
}

const componentSchema = new Schema<Component>({
    title: {type: String, required: true, default: ''},
    code: {type: String, required: true, default: ''},
    type: {type: String, required: true, default: ''},
}, {timestamps: true});

export const ComponentModel = mongoose.model<Component>('Component', componentSchema);