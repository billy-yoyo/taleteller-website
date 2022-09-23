import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export interface DBUpgradeSetProps {
    name: string;
    apiName: string;
    description: string;
    tags: string[];
    upgrades: ObjectId[];
    cost: number;
    scope: DBScope;
}

export type DBUpgradeSet = Document & DBUpgradeSetProps;

const UpgradeSetSchema: Schema = new Schema({
    name: { type: String, required: true },
    apiName: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], required: true },
    upgrades: { type: [Schema.Types.ObjectId], required: true },
    cost: { type: Number, required: true },
    scope: { type: ScopeSchema, required: true }
});

export const UpgradeSet = mongoose.model<DBUpgradeSet>('upgradeSet', UpgradeSetSchema);
