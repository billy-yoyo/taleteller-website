import type { ConditionData, ConditionType, ICondition } from "../models/condition";
import type { ModelID } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createCondition, loadConditions } from "../repo/condition";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreCopyById, createAndStoreMethods, createBaseDefaultsMethods, ensureMethods, ensureModelsInStore } from "./model";

const subModelEffectMapper: {[type in ConditionType]: (condition: ICondition<type>) => ModelID[]} = {
    empty: () => [],
    hasUpgradeSet: () => [],
    hasAbility: () => [],
    hasLevel: () => [],
    hasFeature: () => [],
    and: (cond) => cond.data.conditions.map(id => ({ type: 'condition', id })),
    or: (cond) => cond.data.conditions.map(id => ({ type: 'condition', id })),
    not: (cond) => [{ type: 'condition', id: cond.data.condition }],
};

const getSubModels = <T extends ConditionType>(effect: ICondition<T>): ModelID[] => {
    return subModelEffectMapper[effect.type](effect);
}

export const loadAndStoreConditionModels = async (conditions: ICondition<ConditionType>[]) => {
    conditions.map(condition => idStore.set('condition', condition));

    const subModels: ModelID[] = conditions.map(getSubModels).flat();
    await ensureModelsInStore(subModels);
}

export const loadAndStoreConditions = async (conditionIds: ObjectID[]) => {
    const conditions = await loadConditions(conditionIds);
    await loadAndStoreConditionModels(conditions);
};

export const ensureConditionsInStore = async (conditionIds: ObjectID[]) => {
    const missingIds = conditionIds.filter(id => !idStore.hasModel('condition', id));
    if (missingIds.length > 0) {
        await loadAndStoreConditions(unique(missingIds));
    }
};

ensureMethods['condition'] = ensureConditionsInStore;

export const createAndStoreCondition = async (condition: ICondition<ConditionType>): Promise<ICondition<ConditionType>> => {
    const createdCondition = await createCondition(condition);
    await loadAndStoreConditionModels([createdCondition]);
    return createdCondition;
};

createAndStoreMethods['condition'] = createAndStoreCondition;

const conditionBaseDefaultsMapper: {[type in ConditionType]: (condition: ICondition<type>, scope?: IScope) => Promise<Partial<ConditionData<type>>>} = {
    empty: async () => ({}),
    hasUpgradeSet: async () => ({}),
    hasAbility: async () => ({}),
    hasFeature: async () => ({}),
    hasLevel: async () => ({}),
    and: async (cond, scope) => {
        const conditions = await Promise.all(cond.data.conditions.map(cid => createAndStoreCopyById('condition', cid, {}, scope)));
        return {
            conditions: conditions.map(c => c.id)
        }
    },
    or:  async (cond, scope) => {
        const conditions = await Promise.all(cond.data.conditions.map(cid => createAndStoreCopyById('condition', cid, {}, scope)));
        return {
            conditions: conditions.map(c => c.id)
        }
    },
    not: async (cond, scope) => {
        const condition = await createAndStoreCopyById('condition', cond.data.condition, {}, scope);
        return {
            condition: condition.id
        }
    },
}

export const createConditionBaseDefaults = async <T extends ConditionType>(condition: ICondition<T>, scope?: IScope) => {
    const dataDefaults = await conditionBaseDefaultsMapper[condition.type](condition, scope);
    return {
        data: {
            ...condition.data,
            ...dataDefaults
        }
    }
};

createBaseDefaultsMethods['condition'] = createConditionBaseDefaults;
