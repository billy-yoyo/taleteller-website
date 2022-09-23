import type { IUser, IUserFilters } from "../models/user";
import type { ObjectID } from "../models/objectId";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";
import type { IPagination } from "../models/pagination";
import type { ICard } from "../models/card";

export const loadUsers = async(ids: ObjectID[]): Promise<IUser[]> => {
    return fetchModels('user', ids);
}

export const saveUser = async (user: Partial<IUser> & { id: ObjectID }): Promise<void> => {
    return updateModel('user', user.id, user);
};

saveMethods['user'] = saveUser;

export const createUser = async (user: IUser): Promise<IUser> => {
    return createModel('user', user);
};

export const searchUser = async (filters: IUserFilters & IPagination): Promise<ICard[]> => {
    return searchModels('user', filters);
};

searchMethods['user'] = searchUser;

export const deleteUser = async (id: ObjectID): Promise<void> => {
    return deleteModel('user', id);
};
