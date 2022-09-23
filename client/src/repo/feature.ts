import type { ICard } from "../models/card";
import type { IFeature, IFeatureFilters } from "../models/feature";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadFeatures = async(ids: ObjectID[]): Promise<IFeature[]> => {
    return fetchModels('feature', ids);
}

export const saveFeature = async (feature: Partial<IFeature> & { id: ObjectID }): Promise<void> => {
    return updateModel('feature', feature.id, feature);
};

saveMethods['feature'] = saveFeature;

export const createFeature = async (feature: IFeature): Promise<IFeature> => {
    return createModel('feature', feature);
};

export const searchFeature = async (filters: IFeatureFilters & IPagination): Promise<ICard[]> => {
    return searchModels('feature', filters);
};

searchMethods['feature'] = searchFeature;

export const deleteFeature = async (id: ObjectID): Promise<void> => {
    return deleteModel('feature', id);
};
