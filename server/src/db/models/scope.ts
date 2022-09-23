import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const Scopes = ["global", "campaign", "character", "user", "channel", "message"] as const;
export type ScopeType = (typeof Scopes)[number];

export interface DBScope {
    type: ScopeType;
    link?: ObjectId;
}

export const ScopeSchema = new Schema({
    type: { type: String, enum: Scopes, required: true },
    link: { type: ObjectId, required: false }
});
