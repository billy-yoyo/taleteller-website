import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";

export interface IResource {
    id: ObjectID;
    name: string;
    shortName: string;
    amount: number;
    maxAmount: number;
    scope: IScope;
}

export const createDefaultResource = (defaults: Partial<IResource>, scope: IScope): IResource => ({
    id: undefined,
    name: 'Resource',
    shortName: 'SN',
    amount: 0,
    maxAmount: 0,
    scope,
    ...defaults
});
