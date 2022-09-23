import { ObjectId } from "mongodb";
import { Document } from "mongoose";
import T, { ModelType } from "tsplate";
import { ModelTypes } from "../../db/models/source";
import { TObjectId } from "./helpers/objectId";

export const TCard = T.Object({
    id: TObjectId,
    type: T.Enum(...ModelTypes),
    name: T.String,
    tags: T.Optional(T.Array(T.String)),
    description: T.Optional(T.String),
    cost: T.Optional(T.Float)
});
export type ICard = ModelType<typeof TCard>;

export const CardFields = 'name tags description';

export const createCard = (type: (typeof ModelTypes)[number], result: Document & { name?: string, tags?: string[], description?: string, cost?: number } & { _id: ObjectId }): ICard => {
    return {
        id: result._id,
        type: type,
        name: result.name ?? 'UNKNOWN',
        tags: result.tags ?? [],
        description: result.description,
        cost: result.cost
    }
};

export const TCardsResponse = T.Object({
    cards: T.Array(TCard)
});
