import type { IAction } from "../models/action";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createAction, loadActions } from "../repo/action";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureEffectsInStore } from "./effect";
import { createAndStoreCopyById, createAndStoreMethods, createBaseDefaultsMethods, ensureMethods, ensureModelsInStore } from "./model";

export const loadAndStoreActionModels = async (actions: IAction[]) => {
    actions.forEach(action => idStore.set('action', action));

    await ensureEffectsInStore(actions.map(a => a.effects).flat());
    await ensureActionsInStore(actions.map(a => a.subactions).flat());
    await ensureModelsInStore(actions.map(a => a.source).filter(a => a !== undefined).flat());
};

export const loadAndStoreActions = async (actionIds: ObjectID[]) => {
    const actions = await loadActions(actionIds);
    await loadAndStoreActionModels(actions);
};

export const ensureActionsInStore = async (actionIds: ObjectID[]) => {
    const missingIds = actionIds.filter(id => !idStore.hasModel('action', id));
    if (missingIds.length > 0) {
        await loadAndStoreActions(unique(missingIds));
    }
};

ensureMethods['action'] = ensureActionsInStore;

export const createAndStoreAction = async (action: IAction) => {
    const createdAction = await createAction(action);
    await loadAndStoreActionModels([createdAction]);
    return createdAction;
};

createAndStoreMethods['action'] = createAndStoreAction;

export const createActionBaseDefaults = async (action: IAction, scope?: IScope) => {
    const effects = await Promise.all(
        action.effects.map(eid => createAndStoreCopyById('effect', eid, {}, scope))
    );
    const subActions = await Promise.all(
        action.subactions.map(said => createAndStoreCopyById('action', said, {}, scope))
    );

    return {
        effects: effects.map(effect => effect.id),
        subActions: subActions.map(subActions => subActions.id)
    };
};

createBaseDefaultsMethods['action'] = createActionBaseDefaults;
