import type { Value, ValueType } from "../rolling/rollast";
import type { RollOptions } from "../rolling/roller";
import { optionsFromNameMap } from "../util/funcHelpers";
import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";


export type EffectRollCategory = 'check' | 'damage';
export type EffectTypeMap = {
    empty: {},
    roll: {
        roll: Value<ValueType>,
        originalRoll: string,
        options?: RollOptions
    },
    button: {
        actionId: ObjectID
    },
    ifParam: {
        param: string,
        thenEffectId: ObjectID,
        elseEffectId: ObjectID
    },
    addParam: {
        param: string 
    }
}
export type EffectType = keyof EffectTypeMap;
export type EffectValues<T extends EffectType> = EffectTypeMap[T];

export const EffectTypeNames: {[type in EffectType]: string} = {
    empty: 'Empty',
    roll: 'Roll',
    button: 'Button',
    ifParam: 'If Parameter',
    addParam: 'Add Parameter'
};
export const EffectTypeOptions = optionsFromNameMap(EffectTypeNames);

export const EffectRollCategoryNames: {[category in EffectRollCategory]: string} = {
    check: 'Check Roll',
    damage: 'Damage Roll'
};
export const EffectRollCategoryOptions = optionsFromNameMap(EffectRollCategoryNames);

export interface IEffect<T extends EffectType> {
    id: ObjectID;
    type: T;
    data: EffectValues<T>;
    scope: IScope;
}

export const isEffectType = <T extends EffectType>(effect: IEffect<EffectType>, type: T): effect is IEffect<T> => {
    return effect.type === type;
};

export const createDefaultEffect = (defaults: Partial<IEffect<EffectType>>, scope: IScope): IEffect<EffectType> => ({
    id: undefined,
    type: 'empty',
    data: {},
    scope,
    ...defaults
});
