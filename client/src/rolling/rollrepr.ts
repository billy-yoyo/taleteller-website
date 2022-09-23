import type { Ability } from "../models/unit";
import type { FuncMethod, RollMethod, ValueType } from "./rollast";

export interface RollReprTypeMap {
    roll: {
        rolls: {
            value: number;
            included: boolean;
        }[];
        sides: number;
        method: RollMethod;
        dropLowest: number;
        dropHighest: number;
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
        variable: string;
    },
    multiply: {
        value: RollRepr<RollReprType>;
        multiplier: RollRepr<RollReprType>;
    },
    divide: {
        value: RollRepr<RollReprType>;
        divisor: RollRepr<RollReprType>;
    },
    sum: {
        values: RollRepr<RollReprType>[];
    },
    negate: {
        value: RollRepr<RollReprType>;
    },
    func: {
        method: FuncMethod,
        values: RollRepr<RollReprType>[];
    }
}
export type RollReprType = keyof RollReprTypeMap;
export type RollReprData<T extends RollReprType> = RollReprTypeMap[T];

export interface RollRepr<T extends RollReprType> {
    type: T;
    data: RollReprData<T>;
}

export const isReprType = <T extends RollReprType>(repr: RollRepr<RollReprType>, type: T): repr is RollRepr<T> => {
    return repr.type === type;
}

export const getAbilityString = (ability: Ability): string => {
    if (ability === 'agility') {
        return 'AGI';
    } else if (ability === 'charisma') {
        return 'CHA';
    } else if (ability === 'intelligence') {
        return 'INT'
    } else if (ability === 'might') {
        return 'MIG';
    }
}

export const buildRollString = <T extends RollReprType>(repr: RollRepr<T>): string => {
    if (isReprType(repr, 'roll')) {
        const parts: string[] = [];
        if (repr.data.method !== 'sum') {
            parts.push(`${repr.data.method}:`)
        }
        parts.push(`${repr.data.rolls.length}d${repr.data.sides}`);
        if (repr.data.dropLowest > 0) {
            parts.push(`-w${repr.data.dropLowest}`);
        }
        if (repr.data.dropHighest > 0) {
            parts.push(`-b${repr.data.dropHighest}`);
        }
        return parts.join('');
    } else if (isReprType(repr, 'flatMod')) {
        return `${repr.data.amount}`;
    } else if (isReprType(repr, 'abilityMod')) {
        return getAbilityString(repr.data.ability);
    } else if (isReprType(repr, 'hitMod')) {
        return 'HIT';
    } else if (isReprType(repr, 'proficiencyMod')) {
        return 'PROF';
    } else if (isReprType(repr, 'variableMod')) {
        return repr.data.variable.toUpperCase();
    } else if (isReprType(repr, 'multiply')) {
        return `${buildRollString(repr.data.value)} * ${buildRollString(repr.data.multiplier)}`;
    } else if (isReprType(repr, 'divide')) {
        return `${buildRollString(repr.data.value)} / ${buildRollString(repr.data.divisor)}`;
    } else if (isReprType(repr, 'sum')) {
        return repr.data.values.map(buildRollString).join(' + ');
    } else if (isReprType(repr, 'negate')) {
        return `-${buildRollString(repr.data.value)}`;
    } else if (isReprType(repr, 'func')) {
        return `${repr.data.method} { ${repr.data.values.map(buildRollString).join(', ')} }`;
    }
    return '';
}

export type HitType = 'normal' | 'success' | 'fail';

const getHitTypeFromArray = (hits: HitType[]): HitType => {
    if (hits.every(v => v === 'success')) {
        return 'success';
    } else if (hits.every(v => v === 'fail')) {
        return 'fail';
    } else if (hits.length === 0) {
        return undefined;
    } else {
        return 'normal';
    }
}

const getReprHitType = <T extends RollReprType>(repr: RollRepr<T>): HitType => {
    if (isReprType(repr, 'roll')) {
        if (repr.data.rolls.every(roll => !roll.included || roll.value >= repr.data.critRange[1])) {
            return 'success';
        } else if (repr.data.rolls.every(roll => !roll.included || roll.value <= repr.data.critRange[0])) {
            return 'fail'
        } else {
            return 'normal';
        }
    } else if (isReprType(repr, 'flatMod')) {
        return undefined;
    } else if (isReprType(repr, 'abilityMod')) {
        return undefined;
    } else if (isReprType(repr, 'proficiencyMod')) {
        return undefined;
    } else if (isReprType(repr, 'variableMod')) {
        return undefined;
    } else if (isReprType(repr, 'hitMod')) {
        return undefined;
    } else if (isReprType(repr, 'multiply')) {
        const hits = [getReprHitType(repr.data.value), getReprHitType(repr.data.multiplier)].filter(v => v)
        return getHitTypeFromArray(hits);
    } else if (isReprType(repr, 'divide')) {
        const hits = [getReprHitType(repr.data.value), getReprHitType(repr.data.divisor)].filter(v => v)
        return getHitTypeFromArray(hits);
    } else if (isReprType(repr, 'sum')) {
        const hits = repr.data.values.map(getReprHitType).filter(v => v);
        return getHitTypeFromArray(hits);
    } else if (isReprType(repr, 'negate')) {
        return getReprHitType(repr.data.value);
    } else if (isReprType(repr, 'func')) {
        const hits = repr.data.values.map(getReprHitType).filter(v => v);
        return getHitTypeFromArray(hits);
    }
    return undefined;
};

export const getHitType = (repr: RollRepr<RollReprType>): HitType => {
    return getReprHitType(repr) || 'normal';
};
