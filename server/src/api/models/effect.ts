import { createUnion } from "../../util/templateHelper";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBEffect, DBEffectProps, Effect } from "../../db/models/effect";
import { ObjectId } from "mongodb";
import { TObjectId } from "./helpers/objectId";
import { IScope, mapScopeUpdate, ScopeMap } from "./scope";

export const TEffectRollCategory = T.Enum("check", "damage");

const TEffectMap = {
    empty: T.Object({}),
    roll: T.Object({
        roll: T.Any,
        originalRoll: T.String,
        options: T.Optional(T.Any)
    }),
    button: T.Object({
        actionId: TObjectId
    }),
    ifParam: T.Object({
        param: T.String,
        thenEffectId: TObjectId,
        elseEffectId: TObjectId
    }),
    addParam: T.Object({
        param: T.String
    })
} as const;
export type EffectType = keyof typeof TEffectMap
export type IEffect<T extends EffectType> = {
    id?: ObjectId;
    type: T;
    data: ModelType<(typeof TEffectMap)[T]>;
    scope: IScope;
};
export const TEffect: Template<IEffect<EffectType>, any> = createUnion(TEffectMap);
export const TPartialEffect = T.toPartial(TEffect);

const mapToApi = (effect: DBEffect): IEffect<EffectType> => {
    return {
        id: effect._id,
        type: effect.type,
        data: effect.data,
        scope: ScopeMap.toTransit(effect.scope)
    }
};

const mapToDb = (effect: IEffect<EffectType>): DBEffect => {
    return new Effect({
        _id: effect.id,
        type: effect.type,
        data: effect.data,
        scope: ScopeMap.toModel(effect.scope)
    });
}

export const EffectMap: Template<DBEffect, IEffect<EffectType>> = {
    valid: (t: any): t is IEffect<EffectType> => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapEffectUpdate = (effect: DeepPartial<IEffect<EffectType>> | undefined): DeepPartial<DBEffectProps> | undefined => {
    return effect === undefined ? undefined : {
        type: effect.type,
        data: effect.data,
        scope: mapScopeUpdate(effect.scope)
    };
};
