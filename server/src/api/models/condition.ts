import { createUnion } from "../../util/templateHelper";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBCondition, Condition, DBConditionProps } from "../../db/models/condition";
import { TObjectId } from "./helpers/objectId";
import { Abilities } from "../../db/models/unit";
import { ObjectId } from "mongodb";
import { IScope, mapScopeUpdate, ScopeMap } from "./scope";

const TConditionMap = {
    empty: T.Object({}),
    hasUpgradeSet: T.Object({
        apiName: T.String,
        tags: T.Array(T.String)
    }),
    hasLevel: T.Object({
        greaterThan: T.Float
    }),
    hasAbility: T.Object({
        ability: T.Enum(...Abilities),
        lessThan: T.Optional(T.Float),
        greaterThan: T.Optional(T.Float)
    }),
    hasFeature: T.Object({
        tags: T.Array(T.String)
    }),
    and: T.Object({
        conditions: T.Array(TObjectId)
    }),
    or: T.Object({
        conditions: T.Array(TObjectId)
    }),
    not: T.Object({
        condition: TObjectId
    })
} as const;
export type ConditionType = keyof typeof TConditionMap
export type ICondition<T extends ConditionType> = {
    id?: ObjectId;
    type: T;
    data: ModelType<(typeof TConditionMap)[T]>;
    scope: IScope;
};
export const TCondition: Template<ICondition<ConditionType>, any> = createUnion(TConditionMap);
export const TPartialCondition = T.toPartial(TCondition);

const mapToApi = (condition: DBCondition): ICondition<ConditionType> => {
    return {
        id: condition._id,
        type: condition.type,
        data: condition.data,
        scope: ScopeMap.toTransit(condition.scope)
    }
};

const mapToDb = (condition: ICondition<ConditionType>): DBCondition => {
    return new Condition({
        _id: condition.id,
        type: condition.type,
        data: condition.data,
        scope: ScopeMap.toModel(condition.scope)
    });
}

export const ConditionMap: Template<DBCondition, ICondition<ConditionType>> = {
    valid: (t: any): t is ICondition<ConditionType> => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapConditionUpdate = (condition: DeepPartial<ICondition<ConditionType>> | undefined): DeepPartial<DBConditionProps> | undefined => {
    return condition === undefined ? undefined : {
        type: condition.type,
        data: condition.data,
        scope: mapScopeUpdate(condition.scope)
    };
};
