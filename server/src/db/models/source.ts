import { ObjectId } from "mongodb";
import { Schema } from "mongoose";

export const ModelTypes = [
    "action",
    "actionMod",
    "character",
    "feature",
    "item",
    "resource",
    "upgrade",
    "upgradeSet",
    "effect",
    "user",
    "campaign",
    "condition",
    "class"
] as const;
export type ModelType = (typeof ModelTypes)[number];

export interface DBSource {
    type: ModelType;
    id: ObjectId;
}

export const SourceSchema: Schema = new Schema({
    type: { type: String, enum: ModelTypes, required: true },
    id: { type: Schema.Types.ObjectId, required: true }
});
