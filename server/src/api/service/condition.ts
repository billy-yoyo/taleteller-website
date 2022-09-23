import { ObjectId } from "mongodb";
import { DBCondition, Condition } from "../../db/models/condition";
import { ConditionMap, ConditionType, mapConditionUpdate, TCondition, TPartialCondition } from "../models/condition";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { HydratedDocument } from "mongoose";
import { DBCharacter } from "../../db/models/character";
import { DBClass } from "../../db/models/class";
import { UpgradeSet } from "../../db/models/upgradeSet";
import { Ability } from "../../db/models/unit";
import { Feature } from "../../db/models/feature";
import { modelDeleter } from "./lib/deleter";

export const getConditionModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('condition', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const conditions = await Condition.find({ _id: { $in: filteredIds } });
        return await Promise.all(conditions.map(condition => getConditionModelResponse(condition, parent)));
    } else {
        return [];
    }
};

export const getConditionModelResponse = async (condition: DBCondition, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('condition', TCondition.toTransit(ConditionMap.toTransit(condition)), parent);
    
    if (condition.type === "and" || condition.type === "or") {
        const children = await getConditionModelResponseByIds(condition.data.conditions, response);
        response.addAllChildren(children);
    } else if (condition.type === "not") {
        const children = await getConditionModelResponseByIds([condition.data.condition], response);
        response.addAllChildren(children);
    }

    return response;
};

const conditionMatchers: {[type in ConditionType]: (character: HydratedDocument<DBCharacter, {}, {}>, condition: HydratedDocument<DBCondition, {}, {}>) => Promise<boolean>} = {
    empty: async () => true,
    hasUpgradeSet: async (character, condition) => {
        const reqApiName: string | undefined = condition.data.apiName;
        const reqTags: string[] | undefined = condition.data.tags;
        for (let upgradeSetId of character.upgradeSets) {
            const upgradeSet = await UpgradeSet.findById(upgradeSetId);
            if (upgradeSet && (reqApiName === undefined || upgradeSet.apiName === reqApiName) && (reqTags === undefined || reqTags.every(tag => upgradeSet.tags.includes(tag)))) {
                return true;
            }
        }
        return false;
    },
    hasAbility: async (character, condition) => {
        const score = character.abilities[condition.data.ability as Ability];
        return (condition.data.greaterThan === undefined || score > condition.data.greaterThan) && (condition.data.lessThan === undefined || score < condition.data.lessThan);
    },
    hasLevel: async (character, condition) => {
        return character.level > condition.data.greaterThan;
    },
    hasFeature: async (character, condition) => {
        for (let featureId of character.features) {
            const feature = await Feature.findById(featureId);
            if (feature && condition.data.tags.every((tag: string) => feature.tags.includes(tag))) {
                return true;
            }
        }
        return false;
    },
    and: async (character, condition) => {
        for (let subconditionId of condition.data.conditions) {
            const matches = await matchesCondition(character, subconditionId);
            if (!matches) {
                return false;
            }
        }
        return true;
    },
    or: async (character, condition) => {
        for (let subconditionId of condition.data.conditions) {
            const matches = await matchesCondition(character, subconditionId);
            if (matches) {
                return true;
            }
        }
        return false;
    },
    not: async (character, condition) => {
        const matches = await matchesCondition(character, condition.data.condition);
        return !matches;
    }
};


export const matchesCondition = async (character: HydratedDocument<DBCharacter, {}, {}>, conditionId: ObjectId): Promise<boolean> => {
    const condition = await Condition.findById(conditionId);
    if (condition) {
        const result =  conditionMatchers[condition.type](character, condition);
        return result;
    } else {
        return false;
    }
};

export const getConditions = modelGetter(getConditionModelResponseByIds);
export const createCondition = modelCreator(TCondition, ConditionMap);
export const updateCondition = modelUpdater(TPartialCondition, Condition, mapConditionUpdate);
export const deleteCondition = modelDeleter(Condition);
