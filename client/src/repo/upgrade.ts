import type { IUpgrade, UpgradeType } from "../models/upgrade";
import type { ObjectID } from "../models/objectId";
import { createModel, deleteModel, fetchModels, updateModel } from "./lib/modelFetch";
import { saveMethods } from "./model";

export const loadUpgrades = async(ids: ObjectID[]): Promise<IUpgrade<UpgradeType>[]> => {
    return fetchModels('upgrade', ids);
}

export const saveUpgrade = async (upgrade: Partial<IUpgrade<UpgradeType>> & { id: ObjectID }): Promise<void> => {
    return updateModel('upgrade', upgrade.id, upgrade);
};

saveMethods['upgrade'] = saveUpgrade;

export const createUpgrade = async <T extends UpgradeType>(upgrade: IUpgrade<T>): Promise<IUpgrade<T>> => {
    return await createModel('upgrade', upgrade) as IUpgrade<T>;
};

export const deleteUpgrade = async (id: ObjectID): Promise<void> => {
    return deleteModel('upgrade', id);
};
