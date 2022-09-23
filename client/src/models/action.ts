import type { ModelID } from "./model";
import type { ObjectID } from "./objectId";
import type { IResourceCost } from "./resourceCost";
import type { IScope } from "./scope";

export interface IAction {
    id: ObjectID;
    name: string;
    tags: string[];
    description?: string;
    source?: ModelID;
    cost: IResourceCost[];
    effects: ObjectID[];
    subactions: ObjectID[];
    scope: IScope;
}

export interface IActionFilters {}

export const createDefaultAction = (defaults: Partial<IAction>, scope: IScope): IAction => ({
    id: undefined,
    name: 'Action',
    tags: [],
    description: '',
    cost: [],
    effects: [],
    subactions: [],
    scope,
    ...defaults
});

export const IActionSortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];
