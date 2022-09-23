import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';

export interface DBItemProps {
    name: string;
    quantity: number;
    weight: number;
    equipLoad: number;
    equipped: boolean;
    scope: DBScope;
    actions: ObjectId[];
}

export type DBItem = Document & DBItemProps;

const ItemSchema: Schema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    weight: { type: Number, required: true },
    equipLoad: { type: Number, required: true },
    equipped: { type: Boolean, required: true },
    scope: { type: ScopeSchema, required: true },
    actions: { type: [Schema.Types.ObjectId], required: true }
});

export const Item = mongoose.model<DBItem>('item', ItemSchema);

