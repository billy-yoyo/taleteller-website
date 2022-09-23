import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import type { IUser } from "../models/user";
import { createUser, loadUsers } from "../repo/user";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";

export const loadAndStoreUserModels = async (users: IUser[]) => {
    users.map(user => idStore.set('user', user));
};

export const loadAndStoreUsers = async (userIds: ObjectID[]) => {
    const users = await loadUsers(userIds);
    await loadAndStoreUserModels(users);
};

export const ensureUsersInStore = async (userIds: ObjectID[]) => {
    const missingIds = userIds.filter(id => !idStore.hasModel('user', id));
    if (missingIds.length > 0) {
        await loadAndStoreUsers(unique(missingIds));
    }
};

ensureMethods['user'] = ensureUsersInStore;

export const createAndStoreUser = async (user: IUser) => {
    const createdUser = await createUser(user);
    await loadAndStoreUserModels([createdUser]);
    return createdUser;
}

createAndStoreMethods['user'] = createAndStoreUser;

export const createUserBaseDefaults = async (user: IUser, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['user'] = createUserBaseDefaults;
