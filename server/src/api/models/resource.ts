import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBResource, Resource } from "../../db/models/resource";
import { TObjectId } from "./helpers/objectId";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";

export const TResource = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    shortName: T.String,
    amount: T.Float,
    maxAmount: T.Float,
    scope: TScope
});
export const TPartialResource = T.toPartial(TResource);
export type IResource = ModelType<typeof TResource>;


const mapToApi = (resource: DBResource): IResource => {
    return {
        id: resource._id,
        name: resource.name,
        shortName: resource.shortName,
        amount: resource.amount,
        maxAmount: resource.maxAmount,
        scope: ScopeMap.toTransit(resource.scope)
    }
};

const mapToDb = (resource: IResource): DBResource => {
    return new Resource({
        _id: resource.id,
        name: resource.name,
        shortName: resource.shortName,
        amount: resource.amount,
        maxAmount: resource.maxAmount,
        scope: ScopeMap.toModel(resource.scope)
    });
}

export const ResourceMap: Template<DBResource, IResource> = {
    valid: (t: any): t is IResource => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapResourceUpdate = (resource: DeepPartial<IResource> | undefined): DeepPartial<DBResource> | undefined => {
    return resource === undefined ? undefined : {
        name: resource.name,
        shortName: resource.shortName,
        amount: resource.amount,
        maxAmount: resource.maxAmount,
        scope: mapScopeUpdate(resource.scope)
    };
};
