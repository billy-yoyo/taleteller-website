import { ObjectId } from "mongodb";
import { DBEffect, Effect } from "../../db/models/effect";
import { EffectMap, mapEffectUpdate, TEffect, TPartialEffect } from "../models/effect";
import { TObjectId } from "../models/helpers/objectId";
import { getActionModelResponseByIds } from "./action";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelDeleter } from "./lib/deleter";

export const getEffectModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('effect', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const effects = await Effect.find({ _id: { $in: filteredIds } });
        return await Promise.all(effects.map(effect => getEffectModelResponse(effect, parent)));
    } else {
        return [];
    }
};

export const getEffectModelResponse = async (effect: DBEffect, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('effect', TEffect.toTransit(EffectMap.toTransit(effect)), parent);
    
    if (effect.type === "button") {
        const children = await getActionModelResponseByIds([effect.data.actionId], response);
        response.addAllChildren(children);
    } else if (effect.type === "ifParam") {
        const children = await getEffectModelResponseByIds([effect.data.thenEffectId, effect.data.elseEffectId], response);
        response.addAllChildren(children);
    }

    return response;
};

export const getEffects = modelGetter(getEffectModelResponseByIds);
export const createEffect = modelCreator(TEffect, EffectMap);
export const updateEffect = modelUpdater(TPartialEffect, Effect, mapEffectUpdate);
export const deleteEffect = modelDeleter(Effect);
