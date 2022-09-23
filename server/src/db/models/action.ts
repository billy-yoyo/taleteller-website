import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';
import { DBResourceCost, ResourceCostSchema } from './resourceCost';
import { DBScope, ScopeSchema } from './scope';
import { DBSource, SourceSchema } from './source';

export interface DBActionProps {
    name: string;
    tags: string[];
    description?: string;
    source?: DBSource;
    cost: DBResourceCost[],
    effects: ObjectId[];
    subactions: ObjectId[];
    scope: DBScope
}

export type DBAction = Document & DBActionProps;

const ActionSchema: Schema = new Schema({
    name: { type: String, required: true },
    tags: { type: [String], required: true },
    description: { type: String, required: false },
    source: { type: SourceSchema, required: false },
    cost: { type: [ResourceCostSchema], required: true },
    effects: { type: [Schema.Types.ObjectId], required: true },
    subactions: { type: [Schema.Types.ObjectId], required: true },
    scope: { type: ScopeSchema, required: true }
});

export const Action = mongoose.model<DBAction>('action', ActionSchema);

