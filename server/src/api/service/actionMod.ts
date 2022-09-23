import { ObjectId } from "mongodb";
import { ActionMod, DBActionMod } from "../../db/models/actionMod";
import { ActionModMap, getActionModFilterQuery, mapActionModUpdate, TActionMod, TActionModFilters, TPartialActionMod } from "../models/actionMod";
import { TObjectId } from "../models/helpers/objectId";
import { modelCreator } from "./lib/creator";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelGetter } from "./lib/getter";
import { modelDeleter } from "./lib/deleter";
import { modelSearcher } from "./lib/searcher";

export const getActionModModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('actionMod', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const actionMods = await ActionMod.find({ _id: { $in: filteredIds } });
        return await Promise.all(actionMods.map(actionMod => getActionModModelResponse(actionMod, parent)));
    } else {
        return [];
    }
};

export const getActionModModelResponse = async (actionMod: DBActionMod, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('actionMod', TActionMod.toTransit(ActionModMap.toTransit(actionMod)), parent);
    return response;
};

export const getActionMods = modelGetter(getActionModModelResponseByIds);
export const createActionMod = modelCreator(TActionMod, ActionModMap);
export const updateActionMod = modelUpdater(TPartialActionMod, ActionMod, mapActionModUpdate);
export const searchActionMods = modelSearcher(TActionModFilters, getActionModFilterQuery, ActionMod, 'actionMod');
export const deleteActionMod = modelDeleter(ActionMod);
