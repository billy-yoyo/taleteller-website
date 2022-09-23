import type { ICampaign, ICampaignFilters } from "../models/campaign";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadCampaigns = async (ids: ObjectID[]): Promise<ICampaign[]> => {
    return fetchModels('campaign', ids);
};

export const saveCampaign = async (campaign: Partial<ICampaign> & { id: ObjectID }): Promise<void> => {
    return updateModel('campaign', campaign.id, campaign);
};

saveMethods['campaign'] = saveCampaign;

export const createCampaign = async (campaign: ICampaign): Promise<ICampaign> => {
    return createModel('campaign', campaign);
};

export const searchCampaign = async (filters: ICampaignFilters & IPagination): Promise<ICard[]> => {
    return searchModels('campaign', filters);
};

searchMethods['campaign'] = searchCampaign;

export const deleteCampaign = async (id: ObjectID): Promise<void> => {
    return deleteModel('campaign', id);
};
