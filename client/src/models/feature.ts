import type { ModelID } from "./model";
import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";

export interface IFeature {
    id: ObjectID;
    name: string;
    description: string;
    source?: ModelID;
    scope: IScope;
    tags: string[];
};

export interface IFeatureFilters {};

export const createDefaultFeature = (defaults: Partial<IFeature>, scope: IScope): IFeature => ({
    id: undefined,
    name: 'Feature',
    description: '',
    scope,
    tags: [],
    ...defaults
});

export const IFeatureSortMethods: { name: string, value: string }[] = [
    { name: "Name (Desc)", value: "-name" },
    { name: "Name (Asc)", value: "+name" },
];
