import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';

export const DBCampaignUserTypes = ["admin", "player"] as const;
export type DBCampaignUserType = (typeof DBCampaignUserTypes)[number];

const CampaignUserSchema: Schema = new Schema({
    id: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: DBCampaignUserTypes, required: true }
});

export interface DBCampaignUser {
    id: ObjectId;
    type: DBCampaignUserType;
}

export interface DBCampaignProps {
    name: string;
    characters: ObjectId[];
    users: DBCampaignUser[];
    channel: ObjectId;
}

export type DBCampaign = Document & DBCampaignProps;

const CampaignSchema: Schema = new Schema({
    name: { type: String, required: true },
    characters: { type: [Schema.Types.ObjectId], required: true },
    users: { type: [CampaignUserSchema], required: true },
    channel: { type: Schema.Types.ObjectId, required: true }
});

export const Campaign = mongoose.model<DBCampaign>('campaign', CampaignSchema);

