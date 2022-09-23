import mongoose, { Schema, Document} from 'mongoose';
import { DBResourceCost, ResourceCostSchema } from './resourceCost';
import { DBScope, ScopeSchema } from './scope';

export interface DBActionModProps {
    name: string;
    targetTags: string[];
    costModifiers: DBResourceCost[],
    critModifier: number;
    hitModifier?: any;
    hitModifierOriginalRoll?: string;
    damageModifier?: any;
    damageModifierOriginalRoll?: string;
    scope: DBScope;
}

export type DBActionMod = Document & DBActionModProps;

const ActionModSchema: Schema = new Schema({
    name: { type: [String], required: true },
    targetTags: { type: [String], required: true },
    costModifiers: { type: [ResourceCostSchema], required: true },
    critModifier: { type: Number, required: true },
    hitModifier: { type: Schema.Types.Mixed, required: false },
    hitModifierOriginalRoll: { type: String, required: false },
    damageModifier: { type: Schema.Types.Mixed, required: false },
    damageModifierOriginalRoll: { type: String, required: false },
    scope: { type: ScopeSchema, required: true }
});

export const ActionMod = mongoose.model<DBActionMod>('actionMod', ActionModSchema);

