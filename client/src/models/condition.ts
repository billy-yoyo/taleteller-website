import { optionsFromNameMap } from "../util/funcHelpers";
import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";
import type { Ability } from "./unit";

interface IConditionTypes {
    empty: {},
    hasUpgradeSet: {
        apiName: string;
        tags: string[];
    },
    hasLevel: {
        greaterThan: number
    },
    hasAbility: {
        ability: Ability;
        lessThan?: number;
        greaterThan?: number;
    },
    hasFeature: {
        tags: string[];
    },
    and: {
        conditions: ObjectID[];
    },
    or: {
        conditions: ObjectID[];
    },
    not: {
        condition: ObjectID;
    }
}
export type ConditionType = keyof IConditionTypes;
export type ConditionData<T extends ConditionType> = IConditionTypes[T];

const ConditionTypeNames: {[type in ConditionType]: string} = {
    empty: 'Nothing',
    hasUpgradeSet: 'Has Upgrade',
    hasLevel: 'Has Level',
    hasAbility: 'Has Ability',
    hasFeature: 'Has Feature',
    and: 'All Of The Following',
    or: 'Any Of The Following',
    not: 'Not The Following'
};
export const ConditionTypeOptions = optionsFromNameMap(ConditionTypeNames);

export const isConditionType = <T extends ConditionType>(condition: ICondition<ConditionType>, type: T): condition is ICondition<T> => {
    return condition.type === type;
};

export interface ICondition<T extends ConditionType> {
    id: ObjectID;
    type: T;
    data: ConditionData<T>;
    scope: IScope;
}

export const createDefaultCondition = (defaults: Partial<ICondition<ConditionType>>, scope: IScope): ICondition<ConditionType> => ({
    id: undefined,
    type: 'empty',
    data: {},
    scope,
    ...defaults
});
