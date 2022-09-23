import type { Model, ModelType } from "../models/model";
import type { ObjectID } from "../models/objectId";
import * as idStore from "../store/idStore";

export const sortAndFilter = <T extends ModelType>(ids: ObjectID[], type: T, filter: (model: Model<T>) => boolean, comparator?: (a: Model<T>, b: Model<T>) => number) => {
    return ids.map(id => idStore.getModel(type, id)).filter(filter).sort(comparator).map(model => model.id);
};

export const combineFilters = (...filters: any[]): any => {
    let combined = {};
    filters.forEach(filter => {
        Object.entries(filter).forEach(([k, v]) => {
            if (combined[k]) {
                if (Array.isArray(v) && Array.isArray(combined[k])) {
                    combined[k] += v;
                } else {
                    combined[k] = v;
                }
            } else {
                combined[k] = v;
            }
        });
    });
    return combined;
};
