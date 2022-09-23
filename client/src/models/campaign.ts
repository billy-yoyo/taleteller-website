import type { ObjectID } from "./objectId";

export const ICampaignUserTypes = ["admin", "player"] as const;
export type ICampaignUserType = (typeof ICampaignUserTypes)[number];

export interface ICampaignUser {
    id: ObjectID;
    type: ICampaignUserType;
}

export interface ICampaign {
    id: ObjectID;
    name: string;
    characters: ObjectID[];
    users: ICampaignUser[];
    channel: ObjectID;
}

export interface ICampaignFilters {}

export const createDefaultCampaign = (defaults: Partial<ICampaign>): ICampaign => ({
    id: undefined,
    name: 'Campaign',
    characters: [],
    users: [],
    channel: "",
    ...defaults
});
