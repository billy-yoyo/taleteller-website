import type { ObjectID } from "./objectId";

export interface IChannel {
    id: ObjectID;
    name?: string;
    campaignId?: ObjectID;
    userId?: ObjectID;
}

export const createDefaultChannel = (defaults: Partial<IChannel>): IChannel => ({
    id: undefined,
    ...defaults
});
