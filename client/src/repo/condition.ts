import type { ConditionType, ICondition } from "../models/condition";
import type { ObjectID } from "../models/objectId";
import { createModel, deleteModel, fetchModels, updateModel } from "./lib/modelFetch";
import { saveMethods } from "./model";

export const loadConditions = async(ids: ObjectID[]): Promise<ICondition<ConditionType>[]> => {
    return fetchModels('condition', ids);
}

export const saveCondition = async (condition: Partial<ICondition<ConditionType>> & { id: ObjectID }): Promise<void> => {
    return updateModel('condition', condition.id, condition);
};

saveMethods['condition'] = saveCondition;

export const createCondition = async <T extends ConditionType>(condition: ICondition<T>): Promise<ICondition<T>> => {
    return await createModel('condition', condition) as ICondition<T>;
};

export const deleteCondition = async (id: ObjectID): Promise<void> => {
    return deleteModel('condition', id);
};
