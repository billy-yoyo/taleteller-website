import { ObjectId } from "mongodb";
import T, { Template } from "tsplate";

export const TObjectId: Template<ObjectId, string> = {
    valid: (s: any): s is string => T.String.valid(s) && ObjectId.isValid(s),
    toModel: (s: string) => new ObjectId(s),
    toTransit: (id: ObjectId) => id.toHexString()
};
