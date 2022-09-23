import type { ObjectID } from "./objectId";

export interface IUser {
    id: ObjectID;
    name: string;
    admin: boolean;
}

export interface IUserFilters {
    
}

export const createDefaultUser = (defaults: Partial<IUser>): IUser => ({
    id: undefined,
    name: 'User',
    admin: false,
    ...defaults
});
