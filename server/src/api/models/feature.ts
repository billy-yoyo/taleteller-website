import { FilterQuery } from "mongoose";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBFeature, DBFeatureProps, Feature } from "../../db/models/feature";
import { nameFilters, tagFilters } from "./filters/common";
import { TObjectId } from "./helpers/objectId";
import { TStringArray } from "./helpers/stringArray";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";
import { mapSourceUpdate, TSource } from "./source";

export const TFeature = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    description: T.String,
    source: T.Optional(TSource),
    tags: T.Array(T.String),
    scope: TScope
});
export const TPartialFeature = T.toPartial(TFeature);
export type IFeature = ModelType<typeof TFeature>;

export const TFeatureFilters = T.Object({
    name: T.Optional(T.String),
    tags: T.Optional(TStringArray(",", T.String))
});
export type IFeatureFilters = ModelType<typeof TFeatureFilters>;

const mapToApi = (feature: DBFeature): IFeature => {
    return {
        id: feature._id,
        name: feature.name,
        description: feature.description,
        source: feature.source,
        scope: ScopeMap.toTransit(feature.scope),
        tags: feature.tags
    }
};

const mapToDb = (feature: IFeature): DBFeature => {
    return new Feature({
        _id: feature.id,
        name: feature.name,
        description: feature.description,
        source: feature.source,
        scope: ScopeMap.toModel(feature.scope),
        tags: feature.tags
    });
}

export const FeatureMap: Template<DBFeature, IFeature> = {
    valid: (t: any): t is IFeature => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapFeatureUpdate = (feature: DeepPartial<IFeature> | undefined): DeepPartial<DBFeatureProps> | undefined => {
    return feature === undefined ? undefined : {
        name: feature.name,
        description: feature.description,
        source: mapSourceUpdate(feature.source),
        scope: mapScopeUpdate(feature.scope),
        tags: feature.tags
    };
};

export const getFeatureFilterQuery = (filters: IFeatureFilters): FilterQuery<DBFeature> => {
    return {
        ...nameFilters(filters),
        ...tagFilters(filters)
    };
}

