import { FilterQuery } from "mongoose";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBUpgradeSet, UpgradeSet } from "../../db/models/upgradeSet";
import { nameFilters, tagFilters } from "./filters/common";
import { TObjectId } from "./helpers/objectId";
import { TStringArray } from "./helpers/stringArray";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";

export const TUpgradeSet = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    apiName: T.String,
    description: T.String,
    tags: T.Array(T.String),
    upgrades: T.Array(TObjectId),
    cost: T.Float,
    scope: TScope
});
export const TPartialUpgradeSet = T.toPartial(TUpgradeSet);
export type IUpgradeSet = ModelType<typeof TUpgradeSet>;

export const TUpgradeSetFilters = T.Object({
    name: T.Optional(T.String),
    tags: T.Optional(TStringArray(",", T.String)),
    ids: T.Optional(TStringArray(",", TObjectId))
});
export type IUpgradeSetFilters = ModelType<typeof TUpgradeSetFilters>;

const mapToApi = (upgradeSet: DBUpgradeSet): IUpgradeSet => {
    return {
        id: upgradeSet._id,
        name: upgradeSet.name,
        apiName: upgradeSet.apiName,
        description: upgradeSet.description,
        tags: upgradeSet.tags,
        upgrades: upgradeSet.upgrades,
        cost: upgradeSet.cost,
        scope: ScopeMap.toTransit(upgradeSet.scope)
    }
};

const mapToDb = (upgradeSet: IUpgradeSet): DBUpgradeSet => {
    return new UpgradeSet({
        _id: upgradeSet.id,
        name: upgradeSet.name,
        apiName: upgradeSet.apiName,
        description: upgradeSet.description,
        tags: upgradeSet.tags,
        upgrades: upgradeSet.upgrades,
        cost: upgradeSet.cost,
        scope: ScopeMap.toModel(upgradeSet.scope)
    });
}

export const UpgradeSetMap: Template<DBUpgradeSet, IUpgradeSet> = {
    valid: (t: any): t is IUpgradeSet => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapUpgradeSetUpdate = (upgradeSet: DeepPartial<IUpgradeSet> | undefined): DeepPartial<DBUpgradeSet> | undefined => {
    return upgradeSet === undefined ? undefined : {
        name: upgradeSet.name,
        apiName: upgradeSet.apiName,
        description: upgradeSet.description,
        tags: upgradeSet.tags,
        upgrades: upgradeSet.upgrades,
        cost: upgradeSet.cost,
        scope: mapScopeUpdate(upgradeSet.scope)
    };
};

export const getUpgradeSetFilterQuery = (filters: IUpgradeSetFilters): FilterQuery<DBUpgradeSet> => {
    return {
        ...tagFilters(filters),
        ...nameFilters(filters)
    };
};
