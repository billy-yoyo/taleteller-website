import { Schema } from "mongoose";

export interface DBResourceCost {
    resourceShortName: string;
    amount: number;
    variable?: boolean;
    makeFree?: boolean;
}

export const ResourceCostSchema: Schema = new Schema({
    resourceShortName: { type: String, required: true },
    amount: { type: Number, required: true },
    variable: { type: Boolean, required: false },
    makeFree: { type: Boolean, required: false }
});

