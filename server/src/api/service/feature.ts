import { ObjectId } from "mongodb";
import { Feature, DBFeature } from "../../db/models/feature";
import { FeatureMap, getFeatureFilterQuery, mapFeatureUpdate, TFeature, TFeatureFilters, TPartialFeature } from "../models/feature";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelSearcher } from "./lib/searcher";
import { modelDeleter } from "./lib/deleter";

export const getFeatureModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('feature', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const features = await Feature.find({ _id: { $in: filteredIds } });
        return await Promise.all(features.map(feature => getFeatureModelResponse(feature, parent)));
    } else {
        return [];
    }
};

export const getFeatureModelResponse = async (feature: DBFeature, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('feature', TFeature.toTransit(FeatureMap.toTransit(feature)), parent);
    return response;
};

export const getFeatures = modelGetter(getFeatureModelResponseByIds);
export const createFeature = modelCreator(TFeature, FeatureMap);
export const updateFeature = modelUpdater(TPartialFeature, Feature, mapFeatureUpdate);
export const searchFeatures = modelSearcher(TFeatureFilters, getFeatureFilterQuery, Feature, "feature");
export const deleteFeature = modelDeleter(Feature);
