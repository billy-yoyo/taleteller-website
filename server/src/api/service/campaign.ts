import { ObjectId } from "mongodb";
import { Campaign, DBCampaign } from "../../db/models/campaign";
import { CampaignMap, getCampaignFilterQuery, mapCampaignUpdate, TCampaign, TCampaignFilters, TPartialCampaign } from "../models/campaign";
import { TObjectId } from "../models/helpers/objectId";
import { getChannelModelResponseByIds } from "./channel";
import { modelCreator } from "./lib/creator";
import { modelDeleter } from "./lib/deleter";
import { modelGetter } from "./lib/getter";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelSearcher } from "./lib/searcher";
import { modelUpdater } from "./lib/updater";

export const getCampaignModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('campaign', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const campaigns = await Campaign.find({ _id: { $in: filteredIds } });
        return await Promise.all(campaigns.map(campaign => getCampaignModelResponse(campaign, parent)));
    } else {
        return [];
    }
};

export const getCampaignModelResponse = async (campaign: DBCampaign, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('campaign', TCampaign.toTransit(CampaignMap.toTransit(campaign)), parent);

    const channel = await getChannelModelResponseByIds([campaign.channel], response);
    response.addAllChildren(channel);

    return response;
};

export const getCampaigns = modelGetter(getCampaignModelResponseByIds);
export const createCampaign = modelCreator(TCampaign, CampaignMap);
export const updateCampaign = modelUpdater(TPartialCampaign, Campaign, mapCampaignUpdate);
export const searchCampaigns = modelSearcher(TCampaignFilters, getCampaignFilterQuery, Campaign, "campaign");
export const deleteCampaign = modelDeleter(Campaign);
