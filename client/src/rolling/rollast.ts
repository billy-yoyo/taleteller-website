import type { Ability } from "../models/unit";

export const RollMethods = ["avg", "sum"] as const;
export type RollMethod = (typeof RollMethods)[number];

export const FuncMethods = ["min", "max", "avg"] as const;
export type FuncMethod = (typeof FuncMethods)[number];

interface ValueTypeMap {
    roll: {
        amount: number;
        variable?: string;
        sides: number;
        dropLowest: number;
        dropHighest: number;
        method: RollMethod;
        critRange: [number, number];
    },
    flatMod: {
        amount: number;
    },
    abilityMod: {
        ability: Ability;
    },
    hitMod: {},
    proficiencyMod: {},
    variableMod: {
        variable: string
    },
    multiply: {
        value: Value<ValueType>;
        multiplier: Value<ValueType>;
    },
    divide: {
        value: Value<ValueType>;
        divisor: Value<ValueType>;
    },
    sum: {
        values: Value<ValueType>[];
    },
    negate: {
        value: Value<ValueType>;
    },
    func: {
        method: FuncMethod;
        values: Value<ValueType>[];
    }
}
export type ValueType = keyof ValueTypeMap;
export type ValueData<T extends ValueType> = ValueTypeMap[T];

export interface Value<T extends ValueType> {
    type: T;
    data: ValueData<T>;
}

export const isValueType = <T extends ValueType>(value: Value<ValueType>, type: T): value is Value<T> => {
    return value.type === type;
};
