import type { Value, ValueType } from "../rolling/rollast";
import type { ObjectID } from "./objectId";
import type { IResourceCost } from "./resourceCost";
import type { IScope } from "./scope";

export interface IActionMod {
    id: ObjectID;
    name: string;
    targetTags: string[];
    costModifiers: IResourceCost[];
    critModifier: number;
    hitModifier?: Value<ValueType>;
    hitModifierOriginalRoll?: string;
    damageModifier?: Value<ValueType>;
    damageModifierOriginalRoll?: string;
    scope: IScope;
}

export interface IActionModFilters {}

export const createDefaultActionMod = (defaults: Partial<IActionMod>, scope: IScope): IActionMod => ({
    id: undefined,
    name: 'Action Mod',
    targetTags: [],
    costModifiers: [],
    critModifier: 0,
    scope,
    ...defaults
});

