import type { IItem, IItemFilters } from "../models/item";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadItems = async (ids: ObjectID[]): Promise<IItem[]> => {
    return fetchModels('item', ids);
};

export const saveItem = async (item: Partial<IItem> & { id: ObjectID }): Promise<void> => {
    return updateModel('item', item.id, item);
};

saveMethods['item'] = saveItem;

export const createItem = async (item: IItem): Promise<IItem> => {
    return createModel('item', item);
};

export const searchItem = async (filters: IItemFilters & IPagination): Promise<ICard[]> => {
    return searchModels('item', filters);
};

searchMethods['item'] = searchItem;

export const deleteItem = async (id: ObjectID): Promise<void> => {
    return deleteModel('item', id);
};
