import mongoose, { Schema, Document} from 'mongoose';

export interface DBUserProps {
    name: string;
    admin: boolean;
    username: string;
    passhash: string;
}

export type DBUser = Document & DBUserProps;

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    admin: { type: Boolean, required: true },
    username: { type: String, required: true },
    passhash: { type: String, required: true },
});

export const User = mongoose.model<DBUser>('user', UserSchema);

