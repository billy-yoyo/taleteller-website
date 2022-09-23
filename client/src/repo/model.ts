import type { ICard } from "../models/card";
import type { FilterableModelType, Model, ModelFilter, ModelType } from "../models/model";
import type { ObjectID } from "../models/objectId";
import { IPagination, scopeArray } from "../models/pagination";
import type { IScope } from "../models/scope";

export const saveMethods: {[type in ModelType]?: (model: Partial<Model<type>> & { id: ObjectID }) => Promise<void>} = {};
export const searchMethods: {[type in FilterableModelType]?: (filters: ModelFilter<type> & IPagination) => Promise<ICard[]>} = {};


export const save = <T extends ModelType>(type: T, model: Partial<Model<T>> & { id: ObjectID }): Promise<void> => {
    return saveMethods[type](model);
};

export const search = <T extends FilterableModelType>(type: T, filters: ModelFilter<T> & IPagination): Promise<ICard[]> => {
    return searchMethods[type](filters);
};

export const searchModelsByName = async <T extends FilterableModelType>(type: T, name: string, limit: number, scopes: IScope[]): Promise<ICard[]> => {
    const pagination: IPagination = { limit, page: 0, scopes: scopeArray(...scopes) };
    return search(type, { name, ...pagination } as any);
};
