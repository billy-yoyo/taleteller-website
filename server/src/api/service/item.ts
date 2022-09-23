import { ObjectId } from "mongodb";
import { Item, DBItem } from "../../db/models/item";
import { getItemFilterQuery, ItemMap, mapItemUpdate, TItem, TItemFilters, TPartialItem } from "../models/item";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelSearcher } from "./lib/searcher";
import { modelDeleter } from "./lib/deleter";

export const getItemModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('item', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const items = await Item.find({ _id: { $in: filteredIds } });
        return await Promise.all(items.map(item => getItemModelResponse(item, parent)));
    } else {
        return [];
    }
};

export const getItemModelResponse = async (item: DBItem, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('item', TItem.toTransit(ItemMap.toTransit(item)), parent);
    return response;
};

export const getItems = modelGetter(getItemModelResponseByIds);
export const createItem = modelCreator(TItem, ItemMap);
export const updateItem = modelUpdater(TPartialItem, Item, mapItemUpdate);
export const searchItems = modelSearcher(TItemFilters, getItemFilterQuery, Item, "item");
export const deleteItem = modelDeleter(Item);
