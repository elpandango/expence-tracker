import mongoose, {Schema, Document} from 'mongoose';

export interface ComponentType extends Document {
    name: string;
}

const componentSchema = new Schema<ComponentType>({
    name: {type: String, required: true, default: ''},
}, {timestamps: true});

export const ComponentTypeModel = mongoose.model<ComponentType>('Component-Types', componentSchema);