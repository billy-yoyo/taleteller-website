import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export const UpgradeTypes = ["empty", "changeLevel", "changeAbility", "changeSkill", "changeHp", "changeResource", "changeAC", "changeHitmod",
                             "changeMovespeed", "changeHitDice", "addAction", "addActionMod", "addFeature", "addItem", "changeSelectedSkill",
                             "changeSelectedAbility", "selectActionsByTag", "selectFeaturesByTag", "selectUpgradeSetById", "selectActionToUpgrade"] as const;
export type UpgradeType = (typeof UpgradeTypes)[number];

export interface DBUpgradeProps {
    type: UpgradeType;
    data: any;
    scope: DBScope;
}

export type DBUpgrade = Document & DBUpgradeProps;

const UpgradeSchema: Schema = new Schema({
    type: { type: String, enum: UpgradeTypes, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    scope: { type: ScopeSchema, required: true }
});

export const Upgrade = mongoose.model<DBUpgrade>('upgrade', UpgradeSchema);

