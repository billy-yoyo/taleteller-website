import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export interface DBClassProps {
    name: string;
    description: string;
    tier: number;
    prerequisite: ObjectId;
    levels: ObjectId[][],
    scope: DBScope
}

export type DBClass = Document & DBClassProps;

const ClassSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    tier: { type: Number, required: true },
    prerequisite: { type: Schema.Types.ObjectId, required: true },
    levels: { type: [[Schema.Types.ObjectId]], required: true },
    scope: { type: ScopeSchema, required: true }
});

export const Class = mongoose.model<DBClass>('class', ClassSchema);

