import type { EffectType, EffectValues, IEffect } from "../models/effect";
import type { ModelID } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createEffect, loadEffects } from "../repo/effect";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreCopyById, createAndStoreMethods, createBaseDefaultsMethods, ensureMethods, ensureModelsInStore } from "./model";

const subModelEffectMapper: {[type in EffectType]: (effect: IEffect<type>) => ModelID[]} = {
    empty: () => [],
    roll: () => [],
    button: (e) => [{ type: 'action', id: e.data.actionId }],
    ifParam: (e) => [e.data.elseEffectId, e.data.thenEffectId].filter(x => x !== undefined).map(id => ({ type: 'effect', id })),
    addParam: () => [] 
};

const getSubModels = <T extends EffectType>(effect: IEffect<T>): ModelID[] => {
    return subModelEffectMapper[effect.type](effect);
}

export const loadAndStoreEffectModels = async (effects: IEffect<EffectType>[]) => {
    effects.map(effect => idStore.set('effect', effect));

    const subModels: ModelID[] = effects.map(getSubModels).flat();
    await ensureModelsInStore(subModels);
};

export const loadAndStoreEffects = async (effectIds: ObjectID[]) => {
    const effects = await loadEffects(effectIds);
    await loadAndStoreEffectModels(effects);
};

export const ensureEffectsInStore = async (effectIds: ObjectID[]) => {
    const missingIds = effectIds.filter(id => !idStore.hasModel('effect', id));
    if (missingIds.length > 0) {
        await loadAndStoreEffects(unique(missingIds));
    }
};

ensureMethods['effect'] = ensureEffectsInStore;

export const createAndStoreEffect = async (effect: IEffect<EffectType>) => {
    const createdEffect = await createEffect(effect);
    await loadAndStoreEffectModels([createdEffect]);
    return createdEffect;
};

createAndStoreMethods['effect'] = createAndStoreEffect;

const effectsBaseDefaultsMapper: {[type in EffectType]: (effect: IEffect<type>, scope?: IScope) => Promise<Partial<EffectValues<type>>>} = {
    empty: async () => ({}),
    roll: async () => ({}),
    button: async (effect, scope) => {
        const action = await createAndStoreCopyById('action', effect.data.actionId, {}, scope);
        return {
            actionId: action.id
        }
    },
    ifParam: async (effect, scope) => {
        const thenEffect = await createAndStoreCopyById('effect', effect.data.thenEffectId, {}, scope);
        const elseEffect = await createAndStoreCopyById('effect', effect.data.elseEffectId, {}, scope);
        return {
            thenEffectId: thenEffect.id,
            elseEffectId: elseEffect.id
        }
    },
    addParam: async () => ({})
};

export const createEffectBaseDefaults = async <T extends EffectType>(effect: IEffect<T>, scope?: IScope) => {
    const dataDefaults = await effectsBaseDefaultsMapper[effect.type](effect, scope);
    return {
        data: {
            ...effect.data,
            ...dataDefaults
        }
    };
};

createBaseDefaultsMethods['effect'] = createEffectBaseDefaults;
