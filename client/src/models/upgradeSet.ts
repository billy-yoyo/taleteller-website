import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";

export interface IUpgradeSet {
    id: ObjectID;
    apiName: string;
    name: string;
    description: string;
    tags: string[];
    upgrades: ObjectID[];
    cost: number;
    scope: IScope;
}

export interface IUpgradeSetFilters {
    tags?: string[];
    ids?: ObjectID[];
    name?: string;
}

export const createDefaultUpgradeSet = (defaults: Partial<IUpgradeSet>, scope: IScope): IUpgradeSet => ({
    id: undefined,
    apiName: 'upgrade_set',
    name: 'Upgrade Set',
    description: '',
    tags: [],
    upgrades: [],
    cost: 0,
    scope,
    ...defaults
});

export const IUpgradeSetSortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];
