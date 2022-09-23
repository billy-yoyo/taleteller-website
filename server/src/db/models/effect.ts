import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export const EffectTypes = ["empty", "roll", "button", "ifParam", "addParam"] as const;
export type EffectType = (typeof EffectTypes)[number];

export interface DBEffectProps {
    type: EffectType;
    data: any;
    scope: DBScope;
}

export type DBEffect = Document & DBEffectProps;

const EffectSchema: Schema = new Schema({
    type: { type: String, enum: EffectTypes, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    scope: { type: ScopeSchema, required: true }
});

export const Effect = mongoose.model<DBEffect>('effect', EffectSchema);

