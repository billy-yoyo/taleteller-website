import type { IFeature } from "../models/feature";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createFeature, loadFeatures } from "../repo/feature";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods, ensureModelsInStore } from "./model";

export const loadAndStoreFeatureModels = async (features: IFeature[]) => {
    features.map(feature => idStore.set('feature', feature));

    await ensureModelsInStore(features.map(f => f.source).filter(f => f !== undefined).flat());
}

export const loadAndStoreFeatures = async (featureIds: ObjectID[]) => {
    const features = await loadFeatures(featureIds);
    await loadAndStoreFeatureModels(features);
};

export const ensureFeaturesInStore = async (featureIds: ObjectID[]) => {
    const missingIds = featureIds.filter(id => !idStore.hasModel('feature', id));
    if (missingIds.length > 0) {
        await loadAndStoreFeatures(unique(missingIds));
    }
};

ensureMethods['feature'] = ensureFeaturesInStore;

export const createAndStoreFeature = async (feature: IFeature) => {
    const createdFeature = await createFeature(feature);
    await loadAndStoreFeatureModels([createdFeature]);
    return createdFeature;
}

createAndStoreMethods['feature'] = createAndStoreFeature;

export const createFeatureBaseDefaults = async (feature: IFeature, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['feature'] = createFeatureBaseDefaults;
