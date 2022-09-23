import T, { ModelType, Template, DeepPartial } from "tsplate";
import { mapSourceUpdate, SourceMap, TSource } from "./source";
import { TObjectId } from "./helpers/objectId";
import { DBAction, Action, DBActionProps } from "../../db/models/action";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";
import { TStringArray } from "./helpers/stringArray";
import { FilterQuery } from "mongoose";
import { TResourceCost } from "./resourceCost";
import { nameFilters, tagFilters } from "./filters/common";

export const TAction = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    tags: T.Array(T.String),
    description: T.Optional(T.String),
    source: T.Optional(TSource),
    cost: T.Array(TResourceCost),
    effects: T.Array(TObjectId),
    subactions: T.Array(TObjectId),
    scope: TScope
});
export const TPartialAction = T.toPartial(TAction);
export type IAction = ModelType<typeof TAction>;

export const TActionFilters = T.Object({
    tags: T.Optional(TStringArray(",", T.String)),
    name: T.Optional(T.String)
});
export type IActionFilters = ModelType<typeof TActionFilters>;

const mapToApi = (action: DBAction): IAction => {
    return {
        id: action._id,
        name: action.name,
        tags: action.tags,
        description: action.description,
        source: action.source ? SourceMap.toTransit(action.source) : undefined,
        cost: action.cost,
        effects: action.effects,
        subactions: action.subactions,
        scope: ScopeMap.toTransit(action.scope)
    }
};

const mapToDb = (action: IAction): DBAction => {
    return new Action({
        _id: action.id,
        name: action.name,
        tags: action.tags,
        description: action.description,
        source: action.source ? SourceMap.toModel(action.source) : undefined,
        cost: action.cost,
        effects: action.effects,
        subactions: action.subactions,
        scope: ScopeMap.toModel(action.scope)
    });
};

export const ActionMap: Template<DBAction, IAction> = {
    valid: (t: any): t is IAction => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapActionUpdate = (action: DeepPartial<IAction> | undefined): DeepPartial<DBActionProps> | undefined => {
    return action === undefined ? undefined : {
        name: action.name,
        tags: action.tags,
        description: action.description,
        source: mapSourceUpdate(action.source),
        cost: action.cost,
        effects: action.effects,
        subactions: action.subactions,
        scope: mapScopeUpdate(action.scope)
    };
};

export const getActionFilterQuery = (filters: IActionFilters): FilterQuery<DBAction> => {
    return {
        ...tagFilters(filters),
        ...nameFilters(filters)
    };
};
