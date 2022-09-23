import type { ICard } from "../../models/card";
import type { Model, ModelType } from "../../models/model";
import type { IModelResponse } from "../../models/modelResponse";
import type { ObjectID } from "../../models/objectId";
import type { IPagination } from "../../models/pagination";
import { createFetch } from "./apiFetch";

const CACHE_DURATION_MILLIS = 30_000;
const modelCache: {[type in ModelType]?: {[id in ObjectID]?: [number, any]}} = {};

const cache = (type: ModelType, id: ObjectID, value: any, durationInMillis) => {
    const time = new Date().getTime();
    if (!modelCache[type]) {
        modelCache[type] = {};
    }
    if (!modelCache[id]) {
        modelCache[id] = {};
    }
    modelCache[type][id] = [time, value];

    setTimeout(() => {
        if (modelCache[type] && modelCache[type][id] && modelCache[type][id][0] === time) {
            delete modelCache[type][id];
        }
    }, durationInMillis);
};

const getCached = (type: ModelType, id: ObjectID): any | undefined => {
    if (modelCache[type] && modelCache[type][id]) {
        const value = modelCache[type][id][1];
        delete modelCache[type][id];
        return value;
    }
}

export const fetchModels = async <T extends ModelType>(type: T, ids: ObjectID[], urlOverride?: string, queryOverride?: any): Promise<Model<T>[]> => {
    const remaining: ObjectID[] = [];
    const results: Model<T>[] = [];

    ids.forEach(id => {
        const cached = getCached(type, id);
        if (cached) {
            results.push(cached);
        } else {
            remaining.push(id);
        }
    });

    try {
        if (remaining.length > 0) {
            const response = await createFetch({
                path: urlOverride !== undefined ? urlOverride : `/api/${type}`,
                method: 'GET',
                auth: true,
                query: queryOverride !== undefined ? queryOverride : {
                    ids: encodeURIComponent(remaining.join(','))
                }
            });
            const models = await response.json() as IModelResponse;
            results.push(...models.model);

            Object.entries(models.children).forEach(([childtype, children]) => {
                children.forEach(child => {
                    cache(childtype as ModelType, child.id, child, CACHE_DURATION_MILLIS);
                });
            });
        }
    } catch (e) {
        console.error(`Failed to fetch models of type ${type} with ids ${ids}`, e);
    }
    
    return results;
};

export const updateModel = async (type: ModelType, id: ObjectID, update: any) => {
    await createFetch({
        path: `/api/${type}/${id}`,
        method: 'PUT',
        auth: true,
        json: update
    })
};

export const createModel = async <T extends ModelType>(type: T, create: any): Promise<Model<T>> => {
    const response = await createFetch({
        path: `/api/${type}`,
        method: 'POST',
        auth: true,
        json: create
    });
    const { model } = await response.json();
    return model;
};

export const searchModels = async (type: ModelType, filters: {[key: string]: any} & IPagination): Promise<ICard[]> => {
    const response = await createFetch({
        path: `/api/${type}/search`,
        method: 'GET',
        auth: true,
        query: filters
    });
    const { cards } = await response.json();
    return cards;
};

export const deleteModel = async (type: ModelType, id: ObjectID) => {
    await createFetch({
        path: `/api/${type}/${id}`,
        method: 'DELETE',
        auth: true
    });
}
