import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export interface DBResourceProps {
    name: string;
    shortName: string;
    amount: number;
    maxAmount: number;
    scope: DBScope;
}

export type DBResource = Document & DBResourceProps;

const ResourceSchema: Schema = new Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    amount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    scope: { type: ScopeSchema, required: true }
});

export const Resource = mongoose.model<DBResource>('resource', ResourceSchema);

