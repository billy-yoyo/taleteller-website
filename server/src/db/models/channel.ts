import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';

export interface DBChannelProps {
    name?: string;
    campaignId?: ObjectId;
    userId?: ObjectId;
}

export type DBChannel = Document & DBChannelProps;

const ChannelSchema: Schema = new Schema({
    name: { type: String, required: false },
    campaignId: { type: Schema.Types.ObjectId, required: false },
    userId: { type: Schema.Types.ObjectId, required: false }
});

export const Channel = mongoose.model<DBChannel>('channel', ChannelSchema);

