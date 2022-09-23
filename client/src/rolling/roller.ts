import { Ability, IUnit, Skill, SkillsToAbilities, UnitID } from "../models/unit";
import { avg, sum } from "../util/funcHelpers";
import type { FuncMethod, RollMethod, Value, ValueData, ValueType } from "./rollast";
import { buildRollString, isReprType, RollRepr, RollReprType } from "./rollrepr";

export type RollCategory = 'check' | 'damage';
export interface RollOptions {
    category?: RollCategory;
    proficiency?: number;
    critMod?: number;
    hitMod?: number;
    damageMod?: number;
    variables?: {[name: string]: number};
}

export interface RollResult<T extends RollReprType> {
    value: number;
    repr: RollRepr<T>;
    roller: UnitID;
}

const rollDie = (sides) => {
    return Math.floor(Math.random() * sides) + 1;
};

const rollDice = (amount, sides) => {
    return new Array(amount).fill(0).map(_ => rollDie(sides));
}

const excludeLowest = (rolls: [number, boolean][]) => {
    let lowest = Math.min(...rolls.map(r => r[0]).filter(r => r));
    let lowestIndex = rolls.findIndex(r => r[0] === lowest);
    if (lowestIndex >= 0) {
        rolls[lowestIndex][1] = false;
    }
}

const excludeHighest = (rolls: [number, boolean][]) => {
    let highest = Math.max(...rolls.map(r => r[0]).filter(r => r));
    let highestIndex = rolls.findIndex(r => r[0] === highest);
    if (highestIndex >= 0) {
        rolls[highestIndex][1] = false;
    }
}

const rollMethods: {[method in RollMethod]: (rolls: number[]) => number} = {
    sum: (rolls) => sum(rolls, x => x),
    avg: (rolls) => avg(rolls)
};

const funcMethods: {[method in FuncMethod]: (values: number[]) => number} = {
    min: (values) => Math.min(...values),
    max: (values) => Math.max(...values),
    avg: (values) => avg(values)
};

const reprmappers: {[T in ValueType]: (data: ValueData<T>, options: RollOptions) => RollRepr<T>} = {
    roll: (data, options) => {
        const rolls: [number, boolean][] = rollDice(data.variable ? options.variables[data.variable] * data.amount : data.amount, data.sides).map(value => [value, true]);
        for (let i = 0; i < data.dropLowest; i++) {
            excludeLowest(rolls);
        }
        for (let i = 0; i < data.dropHighest; i++) {
            excludeHighest(rolls);
        }

        return {
            type: 'roll',
            data: {
                rolls: rolls.map(r => ({ value: r[0], included: r[1] })),
                dropHighest: data.dropHighest,
                dropLowest: data.dropLowest,
                method: data.method,
                sides: data.sides,
                critRange: [data.critRange[0], data.critRange[1] + (options.critMod ?? 0)]
            }
        };
    },
    flatMod: (data) => {
        return {
            type: 'flatMod',
            data: {
                amount: data.amount
            }
        };
    },
    abilityMod: (data) => {
        return {
            type: 'abilityMod',
            data: {
                ability: data.ability
            }
        };
    },
    hitMod: (data) => {
        return {
            type: 'hitMod',
            data: {}
        };
    },
    proficiencyMod: (data) => {
        return {
            type: 'proficiencyMod',
            data: {}
        };
    },
    variableMod: (data) => {
        return {
            type: 'variableMod',
            data: {
                variable: data.variable
            }
        }
    },
    multiply: (data, options) => {
        const result = mapToRepr(data.value, options);
        const multiplier = mapToRepr(data.multiplier, options);

        return {
            type: 'multiply',
            data: {
                value: result,
                multiplier: multiplier
            }
        };
    },
    divide: (data, options) => {
        const result = mapToRepr(data.value, options);
        const divisor = mapToRepr(data.divisor, options);

        return {
            type: 'divide',
            data: {
                value: result,
                divisor: divisor
            }
        };
    },
    sum: (data, options) => {
        const results = data.values.map(v => mapToRepr(v, options));
        return {
            type: 'sum',
            data: {
                values: results
            }
        };
    },
    negate: (data, options) => {
        const result = mapToRepr(data.value, options);
        return {
            type: 'negate',
            data: {
                value: result
            }
        };
    },
    func: (data, options) => {
        const results = data.values.map(v =>mapToRepr(v, options));
        return {
            type: 'func',
            data: {
                values: results,
                method: data.method
            }
        };
    }
}

const rollers: {[T in RollReprType]: (unit: IUnit, repr: RollRepr<T>, options: RollOptions) => RollResult<T>} = {
    roll: (unit, repr, options) => {
        const result = rollMethods[repr.data.method.toLowerCase()](
            repr.data.rolls.filter(r => r.included).map(r => r.value)
        );

        return {
            value: result,
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    flatMod: (unit, repr, options) => {
        return {
            value: repr.data.amount,
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    abilityMod: (unit, repr, options) => {
        return {
            value: unit.abilities[repr.data.ability],
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    hitMod: (unit, repr, options) => {
        return {
            value: unit.hitMod,
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    proficiencyMod: (unit, repr, options) => {
        return {
            value: options.proficiency || 0,
            roller: { type: unit.type, id: unit.id },
            repr
        }
    },
    variableMod: (unit, repr, options) => {
        return {
            value: options.variables !== undefined ? (options.variables[repr.data.variable] ?? 0) : 0,
            roller: { type: unit.type, id: unit.id },
            repr
        }
    },
    multiply: (unit, repr, options) => {
        const result = evaluateRepr(unit, repr.data.value, options);
        const multiplier = evaluateRepr(unit, repr.data.multiplier, options);

        return {
            value: result.value * multiplier.value,
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    divide: (unit, repr, options) => {
        const result = evaluateRepr(unit, repr.data.value, options);
        const divisor = evaluateRepr(unit, repr.data.divisor, options);

        return {
            value: result.value / divisor.value,
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    sum: (unit, repr, options) => {
        const results = repr.data.values.map(v => evaluateRepr(unit, v, options));
        const result = sum(results, r => r.value);
        return {
            value: result,
            roller: { type: unit.type, id: unit.id },
            repr
        };
    },
    negate: (unit, repr, options) => {
        const result = evaluateRepr(unit, repr.data.value, options);
        return {
            value: result.value * -1,
            roller: { type: unit.type, id: unit.id },
            repr
        }
    },
    func: (unit, repr, options) => {
        const results = repr.data.values.map(v => evaluateRepr(unit, v, options));
        const values = results.map(r => r.value);
        return {
            value: funcMethods[repr.data.method.toLowerCase()](values),
            roller: { type: unit.type, id: unit.id },
            repr
        };
    }
}

const mapToRepr = <T extends ValueType>(value: Value<T>, options: RollOptions): RollRepr<RollReprType> => {
    let repr: RollRepr<RollReprType> = reprmappers[value.type](value.data, options);

    // do we need to add an extra value to the end due to the options?
    if ((options.damageMod !== undefined && options.category === 'damage') || (options.hitMod !== undefined && options.category === 'check')) {
        const mod = options.category === 'damage' ? options.damageMod : options.hitMod;
        const flatMod: Value<'flatMod'> = { type: 'flatMod', data: { amount: mod } };

        if (isReprType(repr, 'sum')) {
            repr.data.values.push(mapToRepr(flatMod, options));
        } else {
            repr = mapToRepr({ type: 'sum', data: { values: [value, flatMod] } }, options);
        }
    }

    return repr;
};

const evaluateRepr = <T extends RollReprType>(unit: IUnit, repr: RollRepr<T>, options: RollOptions): RollResult<RollReprType> => {
    return rollers[repr.type](unit, repr, options || {});
}

export const evaluate = <T extends ValueType>(unit: IUnit, value: Value<T>, options: RollOptions): RollResult<RollReprType> => {
    const repr = mapToRepr(value, options);
    return evaluateRepr(unit, repr, options);
};

const rollmappers: {[T in RollReprType]: (repr: RollRepr<T>, mapper: (original: RollRepr<'roll'>) => RollRepr<'roll'>) => RollRepr<T>} = {
    roll: (repr, mapper) => {
        return mapper(repr);
    },
    flatMod: (repr) => repr,
    abilityMod: (repr) => repr,
    hitMod: (repr) => repr,
    proficiencyMod: (repr) => repr,
    variableMod: (repr) => repr,
    multiply: (repr, mapper) => {
        return {
            type: 'multiply',
            data: {
                value: mapRolls(repr.data.value, mapper),
                multiplier: mapRolls(repr.data.multiplier, mapper)
            }
        };
    },
    divide: (repr, mapper) => {
        return {
            type: 'divide',
            data: {
                value: mapRolls(repr.data.value, mapper),
                divisor: mapRolls(repr.data.divisor, mapper)
            }
        };
    },
    sum: (repr, mapper) => {
        return {
            type: 'sum',
            data: {
                values: repr.data.values.map(v => mapRolls(v, mapper))
            }
        };
    },
    negate: (repr, mapper) => {
        return {
            type: 'negate',
            data: {
                value: mapRolls(repr.data.value, mapper)
            }
        }
    },
    func: (repr, mapper) => {
        return {
            type: 'func',
            data: {
                method: repr.data.method,
                values: repr.data.values.map(v => mapRolls(v, mapper))
            }
        }
    }
}

const mapRolls = <T extends RollReprType>(repr: RollRepr<T>,  mapper: (original: RollRepr<'roll'>) => RollRepr<'roll'>): RollRepr<T> => {
    return rollmappers[repr.type](repr, mapper);
}

export type NewRollAction = 'min' | 'normal' | 'max';
export type RemoveRollAction = 'lowest' | 'highest' | 'none';
export const modifyRoll = <T extends RollReprType>(unit: IUnit, data: RollResult<T>, newRoll: NewRollAction, remove: RemoveRollAction, options?: RollOptions): RollResult<RollReprType> => {
    const repr = mapRolls(data.repr, roll => {
        const extraDie = newRoll === 'max' ? roll.data.sides : (newRoll === 'min' ? 1 : rollDie(roll.data.sides));
        const newRolls = [...roll.data.rolls, { value: extraDie, included: true }];
        if (remove === 'highest') {
            const highest = Math.max(...newRolls.filter(r => r.included).map(r => r.value));
            newRolls.find(r => r.included && r.value === highest).included = false;
        }
        if (remove === 'lowest') {
            const lowest = Math.min(...newRolls.filter(r => r.included).map(r => r.value));
            newRolls.find(r => r.included && r.value === lowest).included = false;
        }

        return {
            type: 'roll',
            data: {
                rolls: newRolls,
                dropHighest: roll.data.dropHighest + (remove === 'highest' ? 1 : 0),
                dropLowest: roll.data.dropLowest + (remove === 'lowest' ? 1 : 0),
                method: roll.data.method,
                sides: roll.data.sides,
                critRange: roll.data.critRange
            }
        }
    });
    return evaluateRepr(unit, repr, options);
};

export const getAbilityModForSkill = (skill: Skill): Value<ValueType> => {
    const abilities = SkillsToAbilities[skill];
    if (abilities.length === 1) {
        return {
            type: 'abilityMod',
            data: {
                ability: abilities[0]
            }
        };
    } else {
        return {
            type: 'func',
            data: {
                method: 'max',
                values: abilities.map(ability => ({ type: 'abilityMod', data: { ability } }))
            }
        };
    }
};

export const getRollForAbility = (ability: Ability): Value<ValueType> => {
    return {
        type: 'sum',
        data: {
            values: [
                {
                    type: 'roll',
                    data: {
                        amount: 1,
                        sides: 20,
                        dropLowest: 0,
                        dropHighest: 0,
                        method: 'sum',
                        critRange: [1, 20]
                    }
                },
                {
                    type: 'abilityMod',
                    data: {
                        ability
                    }
                }
            ]
        }
    };
}

export const getRollForSkill = (skill: Skill): Value<ValueType> => {
    return {
        type: 'sum',
        data: {
            values: [
                {
                    type: 'roll',
                    data: {
                        amount: 1,
                        sides: 20,
                        dropLowest: 0,
                        dropHighest: 0,
                        method: 'sum',
                        critRange: [1, 20]
                    }
                },
                getAbilityModForSkill(skill),
                {
                    type: 'proficiencyMod',
                    data: {}
                }
            ]
        }
    };
};

export const buildRollStringFromValue = (value: Value<ValueType>, options?: RollOptions): string => {
    return buildRollString(mapToRepr(value, options || {}));
};
