import mongoose, { Schema, Document} from 'mongoose';
import { DBScope, ScopeSchema } from './scope';
import { DBSource, SourceSchema } from './source';

export interface DBFeatureProps {
    name: string;
    description: string;
    source?: DBSource;
    scope: DBScope;
    tags: string[];
}

export type DBFeature = Document & DBFeatureProps;

const FeatureSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: SourceSchema, required: false },
    scope: { type: ScopeSchema, required: true },
    tags: { type: [String], required: true }
});

export const Feature = mongoose.model<DBFeature>('feature', FeatureSchema);

