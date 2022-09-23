import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';

export const MessageSectionTypes = ["title", "text", "roll", "button"] as const;
export type MessageSectionType = (typeof MessageSectionTypes)[number];

export interface DBMessageSection {
    id: string;
    type: MessageSectionType;
    data: any;
}

export const MessageSectionSchema: Schema = new Schema({
    type: { type: String, enum: MessageSectionTypes, required: true },
    data: { type: Schema.Types.Mixed, required: true }
});

export interface DBMessageProps {
    author: ObjectId;
    channel: ObjectId;
    timestamp: number;
    isCard: boolean;
    sections: DBMessageSection[];
}

export type DBMessage = Document & DBMessageProps;

const MessageSchema: Schema = new Schema({
    author: { type: Schema.Types.ObjectId, required: true },
    channel: { type: Schema.Types.ObjectId, required: true },
    timestamp: { type: Number, required: true },
    isCard: { type: Boolean, required: true },
    sections: { type: [MessageSectionSchema], required: true },
});

export const Message = mongoose.model<DBMessage>('message', MessageSchema);

