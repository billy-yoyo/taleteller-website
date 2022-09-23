import type { ObjectID } from "./objectId";

export interface ICard {
    id: ObjectID;
    type: string;
    name: string;
    description?: string;
    tags?: string[];
    cost?: number;
}
