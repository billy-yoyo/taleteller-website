import type { IItem } from "../models/item";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createItem, loadItems } from "../repo/item";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureActionsInStore, loadAndStoreActionModels } from "./action";
import { createAndStoreCopyById, createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";

export const loadAndStoreItemModels = async (items: IItem[]) => {
    await ensureActionsInStore(items.flatMap(item => item.actions));

    items.map(item => idStore.set('item', item));
}

export const loadAndStoreItems = async (itemIds: ObjectID[]) => {
    const items = await loadItems(itemIds);
    await loadAndStoreItemModels(items);
};

export const ensureItemsInStore = async (itemIds: ObjectID[]) => {
    const missingIds = itemIds.filter(id => !idStore.hasModel('item', id));
    if (missingIds.length > 0) {
        await loadAndStoreItems(unique(missingIds));
    }
};

ensureMethods['item'] = ensureItemsInStore;

export const createAndStoreItem = async (item: IItem) => {
    const createdItem = await createItem(item);
    await loadAndStoreItemModels([createdItem]);
    return createdItem;
}

createAndStoreMethods['item'] = createAndStoreItem;

export const createItemBaseDefaults = async (item: IItem, scope?: IScope) => {
    const actions = await Promise.all(item.actions.map(aid => createAndStoreCopyById('action', aid, {}, scope)));

    return {
        actions: actions.map(a => a.id)
    };
};

createBaseDefaultsMethods['item'] = createItemBaseDefaults;
