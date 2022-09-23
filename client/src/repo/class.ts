import type { IClass, IClassFilters } from "../models/class";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadClasses = async (ids: ObjectID[]): Promise<IClass[]> => {
    return fetchModels('class', ids);
};

export const saveClass = async ($class: Partial<IClass> & { id: ObjectID }): Promise<void> => {
    return updateModel('class', $class.id, $class);
};

saveMethods['class'] = saveClass;

export const createClass = async ($class: IClass): Promise<IClass> => {
    return createModel('class', $class);
};

export const searchClass = async (filters: IClassFilters & IPagination): Promise<ICard[]> => {
    return searchModels('class', filters);
};

searchMethods['class'] = searchClass;

export const deleteClass = async (id: ObjectID): Promise<void> => {
    return deleteModel('class', id);
};
