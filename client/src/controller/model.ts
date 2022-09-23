import { copyModel, createDefaultModel, Model, ModelID, ModelType } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { groupBy } from "../util/funcHelpers";
import * as idStore from "../store/idStore";

export const ensureMethods: {[type in ModelType]?: (ids: ObjectID[]) => Promise<void>} = {};

export const ensureModelsInStore = async (modelIds: ModelID[]) => {
    const modelGroups = groupBy(modelIds, mid => mid.type);
    await Promise.all(Object.entries(modelGroups).map(([type, mids]) => {
        return ensureMethods[type](mids.map(mid => mid.id));
    }));
};

export const createAndStoreMethods: {[type in ModelType]?: (model: Model<type>) => Promise<Model<type>>} = {};

export const createAndStoreModel = async <T extends ModelType>(type: T, model: Model<T>): Promise<Model<T>> => {
    return createAndStoreMethods[type](model);
};

export const defaultDependantSetup: {[type in ModelType]?: (scope?: IScope) => Promise<Partial<Model<type>>>} = {};

export const setupDefaultModelDependants = async <T extends ModelType>(type: T, scope?: IScope): Promise<Partial<Model<T>>> => {
    const setup = defaultDependantSetup[type];
    if (setup) {
        return setup(scope);
    } else {
        return {};
    }
};

export const createAndStoreDefaultModel = async <T extends ModelType>(type: T, scope?: IScope, data?: Partial<Model<T>>): Promise<Model<T>> => {
    const dependants = await setupDefaultModelDependants(type, scope);
    const defaults = {
        ...(data || {}),
        ...dependants
    };

    const defaultModel = createDefaultModel(type, defaults, scope);
    const createdModel = await createAndStoreModel(type, defaultModel);
    return createdModel;
};

export const createBaseDefaultsMethods: {[type in ModelType]?: (model: Model<type>, scope?: IScope) => Promise<Partial<Model<type>>>} = {};

const createBaseDefaults = async <T extends ModelType>(type: T, model: Model<T>, scope?: IScope): Promise<Partial<Model<T>>> => {
    if (createBaseDefaultsMethods[type]) {
        return createBaseDefaultsMethods[type](model, scope);
    } else {
        return Promise.resolve({});
    }
};

export const createAndStoreCopy = async <T extends ModelType>(type: T, model: Model<T>, defaults: Partial<Model<T>>, scope?: IScope): Promise<Model<T>> => {
    const baseDefaults = await createBaseDefaults(type, { ...model, ...defaults }, scope);
    const copy = copyModel(model, { ...defaults, ...baseDefaults }, scope);
    const createdModel = await createAndStoreModel(type, copy);
    return createdModel;
};

export const createAndStoreCopyById = async <T extends ModelType>(type: T, modelId: ObjectID, defaults: Partial<Model<T>>, scope?: IScope) => {
    const model = idStore.getModel(type, modelId);
    return await createAndStoreCopy(type, model, defaults, scope);
};
