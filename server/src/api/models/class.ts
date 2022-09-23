import { FilterQuery } from "mongoose";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBClass, Class, DBClassProps } from "../../db/models/class";
import { nameFilters } from "./filters/common";
import { TIntString } from "./helpers/numberString";
import { TObjectId } from "./helpers/objectId";
import { TStringArray } from "./helpers/stringArray";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";

export const TClass = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    description: T.String,
    tier: T.Int,
    prerequisite: TObjectId,
    levels: T.Array(T.Array(TObjectId)),
    scope: TScope
});
export const TPartialClass = T.toPartial(TClass);
export type IClass = ModelType<typeof TClass>;

export const TClassFilters = T.Object({
    tiers: T.Optional(TStringArray(',', TIntString)),
    characterId: T.Optional(TObjectId),
    name: T.Optional(T.String)
});
export type IClassFilters = ModelType<typeof TClassFilters>;

const mapToApi = ($class: DBClass): IClass => {
    return {
        id: $class._id,
        name: $class.name,
        description: $class.description,
        tier: $class.tier,
        prerequisite: $class.prerequisite,
        levels: $class.levels,
        scope: ScopeMap.toTransit($class.scope)
    }
};

const mapToDb = ($class: IClass): DBClass => {
    return new Class({
        _id: $class.id,
        name: $class.name,
        description: $class.description,
        tier: $class.tier,
        prerequisite: $class.prerequisite,
        levels: $class.levels,
        scope: ScopeMap.toModel($class.scope)
    });
}

export const ClassMap: Template<DBClass, IClass> = {
    valid: (t: any): t is IClass => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapClassUpdate = ($class: DeepPartial<IClass> | undefined): DeepPartial<DBClassProps> | undefined => {
    return $class === undefined ? undefined : {
        name: $class.name,
        description: $class.description,
        tier: $class.tier,
        prerequisite: $class.prerequisite,
        levels: $class.levels,
        scope: mapScopeUpdate($class.scope)
    }
};

const tierFilters = (filters: IClassFilters): FilterQuery<DBClass> => {
    return filters.tiers === undefined ? {} : {
        tier: {
            $in: filters.tiers
        }
    };
};

export const getClassFilterQuery = (filters: IClassFilters): FilterQuery<DBClass> => {
    return {
        ...nameFilters(filters),
        ...tierFilters(filters)
    };
}
