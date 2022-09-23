import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";

export interface IClass {
    id: ObjectID;
    name: string;
    description: string;
    tier: number;
    prerequisite: ObjectID;
    levels: [
        ObjectID[],
        ObjectID[],
        ObjectID[],
        ObjectID[],
        ObjectID[]
    ],
    scope: IScope
}

export interface IClassFilters {}

export const createDefaultClass = (defaults: Partial<IClass>, scope: IScope): IClass => ({
    id: undefined,
    name: 'Class',
    description: '',
    tier: 1,
    prerequisite: "",
    levels: [[], [], [], [], []],
    scope,
    ...defaults
});

export const IClassSortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];

