import type { ICampaign } from "../models/campaign";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createCampaign, loadCampaigns } from "../repo/campaign";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureChannelsInStore } from "./channel";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";

export const loadAndStoreCampaignModels = async (campaigns: ICampaign[]) => {
    campaigns.map(campaign => idStore.set('campaign', campaign));
    await ensureChannelsInStore(campaigns.map(f => f.channel));
}

export const loadAndStoreCampaigns = async (campaignIds: ObjectID[]) => {
    const campaigns = await loadCampaigns(campaignIds);
    await loadAndStoreCampaignModels(campaigns);
};

export const ensureCampaignsInStore = async (campaignIds: ObjectID[]) => {
    const missingIds = campaignIds.filter(id => !idStore.hasModel('campaign', id));
    if (missingIds.length > 0) {
        await loadAndStoreCampaigns(unique(missingIds));
    }
};

ensureMethods['campaign'] = ensureCampaignsInStore;

export const createAndStoreCampaign = async (campaign: ICampaign) => {
    const createdCampaign = await createCampaign(campaign);
    await loadAndStoreCampaignModels([createdCampaign]);
    return createdCampaign;
};

createAndStoreMethods['campaign'] = createAndStoreCampaign;

export const createCampaignBaseDefaults = async (campaign: ICampaign, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['campaign'] = createCampaignBaseDefaults;
