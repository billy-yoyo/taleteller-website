import { FilterQuery } from "mongoose";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBItem, DBItemProps, Item } from "../../db/models/item";
import { TObjectId } from "./helpers/objectId";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";

export const TItem = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    quantity: T.Float,
    weight: T.Float,
    equipLoad: T.Float,
    equipped: T.Boolean,
    actions: T.Array(TObjectId),
    scope: TScope
});
export const TPartialItem = T.toPartial(TItem);
export type IItem = ModelType<typeof TItem>;

export const TItemFilters = T.Object({

});
export type IItemFilters = ModelType<typeof TItemFilters>;

const mapToApi = (item: DBItem): IItem => {
    return {
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        equipLoad: item.equipLoad,
        equipped: item.equipped,
        actions: item.actions,
        scope: ScopeMap.toTransit(item.scope)
    }
};

const mapToDb = (item: IItem): DBItem => {
    return new Item({
        _id: item.id,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        equipLoad: item.equipLoad,
        equipped: item.equipped,
        actions: item.actions,
        scope: ScopeMap.toModel(item.scope)
    });
}

export const ItemMap: Template<DBItem, IItem> = {
    valid: (t: any): t is IItem => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapItemUpdate = (item: DeepPartial<IItem> | undefined): DeepPartial<DBItemProps> | undefined => {
    return item === undefined ? undefined : {
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        equipLoad: item.equipLoad,
        equipped: item.equipped,
        actions: item.actions,
        scope: mapScopeUpdate(item.scope)
    }
};

export const getItemFilterQuery = (filters: IItemFilters): FilterQuery<DBItem> => {
    return {};
}
