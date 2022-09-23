import { FilterQuery } from "mongoose";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBCampaign, Campaign, DBCampaignUserTypes, DBCampaignProps } from "../../db/models/campaign";
import { TObjectId } from "./helpers/objectId";

export const TCampaignUser = T.Object({
    id: TObjectId,
    type: T.Enum(...DBCampaignUserTypes)
})

export const TCampaign = T.Object({
    id: T.Optional(T.String),
    name: T.String,
    characters: T.Array(TObjectId),
    users: T.Array(TCampaignUser),
    channel: TObjectId
});
export const TPartialCampaign = T.toPartial(TCampaign);
export type ICampaign = ModelType<typeof TCampaign>;

export const TCampaignFilters = T.Object({

});
export type ICampaignFilters = ModelType<typeof TCampaignFilters>;

const mapToApi = (campaign: DBCampaign): ICampaign => {
    return {
        id: campaign._id.toHexString(),
        name: campaign.name,
        characters: campaign.characters,
        users: campaign.users,
        channel: campaign.channel
    }
};

const mapToDb = (campaign: ICampaign): DBCampaign => {
    return new Campaign({
        _id: campaign.id,
        name: campaign.name,
        characters: campaign.characters,
        users: campaign.users,
        channel: campaign.channel
    });
}

export const CampaignMap: Template<DBCampaign, ICampaign> = {
    valid: (t: any): t is ICampaign => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapCampaignUpdate = (campaign: DeepPartial<ICampaign> | undefined): DeepPartial<DBCampaignProps> | undefined => {
    return campaign === undefined ? undefined : {
        name: campaign.name,
        characters: campaign.characters,
        users: campaign.users,
        channel: campaign.channel
    };
};

export const getCampaignFilterQuery = (filters: ICampaignFilters): FilterQuery<DBCampaign> => {
    return {};
};
