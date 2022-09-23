import type { EffectType, IEffect } from "../models/effect";
import type { ObjectID } from "../models/objectId";
import { createModel, deleteModel, fetchModels, updateModel } from "./lib/modelFetch";
import { saveMethods } from "./model";

export const loadEffects = async(ids: ObjectID[]): Promise<IEffect<EffectType>[]> => {
    return fetchModels('effect', ids);
}

export const saveEffect = async (effect: Partial<IEffect<EffectType>> & { id: ObjectID }): Promise<void> => {
    return updateModel('effect', effect.id, effect);
};

saveMethods['effect'] = saveEffect;

export const createEffect = async <T extends EffectType>(effect: IEffect<T>): Promise<IEffect<T>> => {
    return await createModel('effect', effect) as IEffect<T>;
};

export const deleteEffect = async (id: ObjectID): Promise<void> => {
    return deleteModel('effect', id);
};
