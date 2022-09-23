import type { IActionMod } from "../models/actionMod";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createActionMod, loadActionMods } from "../repo/actionMod";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureActionsInStore } from "./action";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";

export const loadAndStoreActionModModels = async (actionMods: IActionMod[]) => {
    actionMods.forEach(actionMod => idStore.set('actionMod', actionMod));
};

export const loadAndStoreActionMods = async (actionModIds: ObjectID[]) => {
    const actionMods = await loadActionMods(actionModIds);
    await loadAndStoreActionModModels(actionMods);
};

export const ensureActionModsInStore = async (actionModIds: ObjectID[]) => {
    const missingIds = actionModIds.filter(id => !idStore.hasModel('actionMod', id));
    if (missingIds.length > 0) {
        await loadAndStoreActionMods(unique(missingIds));
    }
};

ensureMethods['actionMod'] = ensureActionModsInStore;

export const createAndStoreActionMod = async (actionMod: IActionMod) => {
    const createdActionMod = await createActionMod(actionMod);
    await loadAndStoreActionModModels([createdActionMod]);
    return createdActionMod;
};

createAndStoreMethods['actionMod'] = createAndStoreActionMod;

export const createActionModBaseDefaults = async (actionMod: IActionMod, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['actionMod'] = createActionModBaseDefaults;
