import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";

export interface IItem {
    id: ObjectID;
    name: string;
    quantity: number;
    weight: number;
    equipLoad: number;
    equipped: boolean;
    scope: IScope;
    actions: ObjectID[];
}

export interface IItemFilters {}

export const createDefaultItem = (defaults: Partial<IItem>, scope: IScope): IItem => ({
    id: undefined,
    name: 'Item',
    quantity: 0,
    weight: 0,
    equipLoad: 0,
    equipped: false,
    scope,
    actions: [],
    ...defaults
});
