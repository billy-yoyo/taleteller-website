import { ObjectId } from "mongodb";
import { Action, DBAction } from "../../db/models/action";
import { ActionMap, getActionFilterQuery, mapActionUpdate, TAction, TActionFilters, TPartialAction } from "../models/action";
import { TObjectId } from "../models/helpers/objectId";
import { getEffectModelResponseByIds } from "./effect";
import { modelCreator } from "./lib/creator";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelGetter } from "./lib/getter";
import { modelSearcher } from "./lib/searcher";
import { modelDeleter } from "./lib/deleter";

export const getActionModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('action', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const actions = await Action.find({ _id: { $in: filteredIds } });
        return await Promise.all(actions.map(action => getActionModelResponse(action, parent)));
    } else {
        return [];
    }
};

export const getActionModelResponse = async (action: DBAction, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('action', TAction.toTransit(ActionMap.toTransit(action)), parent);

    const effects = await getEffectModelResponseByIds(action.effects, response);
    response.addAllChildren(effects);

    const subactions = await getActionModelResponseByIds(action.subactions, response);
    response.addAllChildren(subactions);

    return response;
};

export const getActions = modelGetter(getActionModelResponseByIds);
export const createAction = modelCreator(TAction, ActionMap);
export const updateAction = modelUpdater(TPartialAction, Action, mapActionUpdate);
export const searchActions = modelSearcher(TActionFilters, getActionFilterQuery, Action, 'action');
export const deleteAction = modelDeleter(Action);
