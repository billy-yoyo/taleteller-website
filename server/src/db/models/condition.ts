import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export const ConditionTypes = ["empty", "hasUpgradeSet", "hasLevel", "hasAbility", "hasFeature", "and", "or", "not"] as const;
export type ConditionType = (typeof ConditionTypes)[number];

export interface DBConditionProps {
    type: ConditionType;
    data: any;
    scope: DBScope;
}

export type DBCondition = Document & DBConditionProps;

const ConditionSchema: Schema = new Schema({
    type: { type: String, enum: ConditionTypes, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    scope: { type: ScopeSchema, required: true }
});

export const Condition = mongoose.model<DBCondition>('condition', ConditionSchema);

