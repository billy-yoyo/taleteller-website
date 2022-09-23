import type { ICharacter } from "../models/character";
import type { ConditionData, ConditionType, ICondition } from "../models/condition";
import * as idStore from "../store/idStore";

const conditionMatchers: {[type in ConditionType]: (data: ConditionData<type>, character: ICharacter) => boolean} = {
    empty: () => true,
    hasUpgradeSet: (data, char) => {
        return char.upgradeSets.map(usid => idStore.getModel('upgradeSet', usid)).find(us => 
            (data.apiName === undefined || us.apiName === data.apiName) && (data.tags === undefined || data.tags.every(tag => us.tags.includes(tag)))
        ) !== undefined;
    },
    hasAbility: (data, char) => {
        const score = char.abilities[data.ability];
        return (data.greaterThan === undefined || score > data.greaterThan) && (data.lessThan === undefined || score < data.lessThan);
    },
    hasLevel: (data, char) => {
        return char.level > data.greaterThan;
    },
    hasFeature: (data, char) => {
        return char.features.map(fid => idStore.getModel('feature', fid)).find(f => data.tags.every(tag => f.tags.includes(tag))) !== undefined;
    },
    and: (data, char) => {
        return data.conditions.every(cond => matchesCondition(char, idStore.getModel('condition', cond)));
    },
    or: (data, char) => {
        return data.conditions.some(cond => matchesCondition(char, idStore.getModel('condition', cond)));
    },
    not: (data, char) => {
        return !matchesCondition(char, idStore.getModel('condition', data.condition));
    }
};

export const matchesCondition = <T extends ConditionType>(character: ICharacter, condition: ICondition<T>): boolean => {
    return conditionMatchers[condition.type](condition.data, character);
};
