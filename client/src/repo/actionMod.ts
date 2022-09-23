import type { IActionMod, IActionModFilters } from "../models/actionMod";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadActionMods = async (ids: ObjectID[]): Promise<IActionMod[]> => {
    return fetchModels('actionMod', ids);
};

export const saveActionMod = async (actionMod: Partial<IActionMod> & { id: ObjectID }): Promise<void> => {
    return updateModel('actionMod', actionMod.id, actionMod);
};

saveMethods['actionMod'] = saveActionMod;

export const createActionMod = async (actionMod: IActionMod): Promise<IActionMod> => {
    return createModel('actionMod', actionMod);
};

export const searchActionMod = async (filters: IActionModFilters & IPagination): Promise<ICard[]> => {
    return searchModels('actionMod', filters);
};

searchMethods['actionMod'] = searchActionMod;

export const deleteActionMod = async (id: ObjectID): Promise<void> => {
    return deleteModel('actionMod', id);
};
