import { ObjectId } from "mongodb";
import { Class, DBClass } from "../../db/models/class";
import { ClassMap, getClassFilterQuery, IClassFilters, mapClassUpdate, TClass, TClassFilters, TPartialClass } from "../models/class";
import { TObjectId } from "../models/helpers/objectId";
import { getConditionModelResponseByIds, matchesCondition } from "./condition";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { getUpgradeSetModelResponseByIds } from "./upgradeSet";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelSearcher } from "./lib/searcher";
import { HydratedDocument } from "mongoose";
import { Condition, ConditionType, DBCondition } from "../../db/models/condition";
import { Character, DBCharacter } from "../../db/models/character";
import { Ability } from "../../db/models/unit";
import { UpgradeSet } from "../../db/models/upgradeSet";
import { modelDeleter } from "./lib/deleter";

export const getClassModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('class', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const $classes = await Class.find({ _id: { $in: filteredIds } });
        return await Promise.all($classes.map($class => getClassModelResponse($class, parent)));
    } else {
        return [];
    }
};

export const getClassModelResponse = async ($class: DBClass, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('class', TClass.toTransit(ClassMap.toTransit($class)), parent);

    const prerequisite = await getConditionModelResponseByIds([$class.prerequisite], response);
    response.addAllChildren(prerequisite);

    const levels = await getUpgradeSetModelResponseByIds($class.levels.flat(), response);
    response.addAllChildren(levels);

    return response;
};

const getCustomClassTags = ($class: HydratedDocument<DBClass, {}, {}>): string[] => {
    return [`Tier ${$class.tier}`];
};

const classPrerequisiteFilter = async (filter: IClassFilters, $class: HydratedDocument<DBClass, {}, {}>): Promise<boolean> => {
    if (filter.characterId !== undefined) {
        const character = await Character.findById(filter.characterId);
        if (character) {
            return await matchesCondition(character, $class.prerequisite);
        } else {
            return false;
        }
    } else {
        return true;
    }
};

export const getClasses = modelGetter(getClassModelResponseByIds);
export const createClass = modelCreator(TClass, ClassMap);
export const updateClass = modelUpdater(TPartialClass, Class, mapClassUpdate);
export const searchClasses = modelSearcher(TClassFilters, getClassFilterQuery, Class, "class", "tier prerequisite", getCustomClassTags, classPrerequisiteFilter);
export const deleteClass = modelDeleter(Class);
