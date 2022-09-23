import type { IAction, IActionFilters } from "../models/action";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadActions = async (ids: ObjectID[]): Promise<IAction[]> => {
    return fetchModels('action', ids);
};

export const saveAction = async (action: Partial<IAction> & { id: ObjectID }): Promise<void> => {
    return updateModel('action', action.id, action);
};

saveMethods['action'] = saveAction;

export const createAction = async (action: IAction): Promise<IAction> => {
    return createModel('action', action);
};

export const searchAction = async (filters: IActionFilters & IPagination): Promise<ICard[]> => {
    return searchModels('action', filters);
};

searchMethods['action'] = searchAction;

export const deleteAction = async (id: ObjectID): Promise<void> => {
    return deleteModel('action', id);
};
