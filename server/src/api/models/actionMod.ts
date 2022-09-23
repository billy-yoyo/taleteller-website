import T, { ModelType, Template, DeepPartial } from "tsplate";
import { TObjectId } from "./helpers/objectId";
import { DBActionMod, ActionMod, DBActionModProps } from "../../db/models/actionMod";
import { TStringArray } from "./helpers/stringArray";
import { mapScopeUpdate, ScopeMap, TScope } from "./scope";
import { TResourceCost } from "./resourceCost";
import { nameFilters, tagFilters } from "./filters/common";
import { FilterQuery } from "mongoose";

export const TActionMod = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    targetTags: T.Array(T.String),
    costModifiers: T.Array(TResourceCost),
    critModifier: T.Int,
    hitModifier: T.Optional(T.Any),
    hitModifierOriginalRoll: T.Optional(T.String),
    damageModifier: T.Optional(T.Any),
    damageModifierOriginalRoll: T.Optional(T.String),
    scope: TScope
});
export const TPartialActionMod = T.toPartial(TActionMod);
export type IActionMod = ModelType<typeof TActionMod>;

export const TActionModFilters = T.Object({
    tags: T.Optional(TStringArray(",", T.String)),
    name: T.Optional(T.String)
});
export type IActionModFilters = ModelType<typeof TActionModFilters>;

const mapToApi = (actionMod: DBActionMod): IActionMod => {
    return {
        id: actionMod._id,
        name: actionMod.name,
        targetTags: actionMod.targetTags,
        costModifiers: actionMod.costModifiers,
        critModifier: actionMod.critModifier,
        hitModifier: actionMod.hitModifier,
        hitModifierOriginalRoll: actionMod.hitModifierOriginalRoll,
        damageModifier: actionMod.damageModifier,
        damageModifierOriginalRoll: actionMod.damageModifierOriginalRoll,
        scope: ScopeMap.toTransit(actionMod.scope)
    }
};

const mapToDb = (actionMod: IActionMod): DBActionMod => {
    return new ActionMod({
        _id: actionMod.id,
        name: actionMod.name,
        targetTags: actionMod.targetTags,
        costModifiers: actionMod.costModifiers,
        critModifier: actionMod.critModifier,
        hitModifier: actionMod.hitModifier,
        hitModifierOriginalRoll: actionMod.hitModifierOriginalRoll,
        damageModifier: actionMod.damageModifier,
        damageModifierOriginalRoll: actionMod.damageModifierOriginalRoll,
        scope: ScopeMap.toModel(actionMod.scope)
    });
};

export const ActionModMap: Template<DBActionMod, IActionMod> = {
    valid: (t: any): t is IActionMod => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const getActionModFilterQuery = (filters: IActionModFilters): FilterQuery<DBActionMod> => {
    return {
        ...tagFilters(filters),
        ...nameFilters(filters)
    };
};


export const mapActionModUpdate = (actionMod: DeepPartial<IActionMod> | undefined): DeepPartial<DBActionModProps> | undefined => {
    return actionMod === undefined ? undefined : {
        name: actionMod.name,
        targetTags: actionMod.targetTags,
        costModifiers: actionMod.costModifiers,
        critModifier: actionMod.critModifier,
        hitModifier: actionMod.hitModifier,
        hitModifierOriginalRoll: actionMod.hitModifierOriginalRoll,
        damageModifier: actionMod.damageModifier,
        damageModifierOriginalRoll: actionMod.damageModifierOriginalRoll,
        scope: mapScopeUpdate(actionMod.scope)
    };
};
