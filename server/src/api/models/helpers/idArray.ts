import { ObjectId } from "mongodb";
import T, { Template } from "tsplate";
import { TObjectId } from "./objectId";
import { TStringArray } from "./stringArray";

export const TIdArray: Template<ObjectId[], string> = TStringArray(",", TObjectId);
