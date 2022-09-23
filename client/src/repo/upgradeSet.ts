import type { IUpgradeSet, IUpgradeSetFilters } from "../models/upgradeSet";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadUpgradeSets = async (ids: ObjectID[]): Promise<IUpgradeSet[]> => {
    return fetchModels('upgradeSet', ids);
};

export const saveUpgradeSet = async (upgradeSet: Partial<IUpgradeSet> & { id: ObjectID }): Promise<void> => {
    return updateModel('upgradeSet', upgradeSet.id, upgradeSet);
};

saveMethods['upgradeSet'] = saveUpgradeSet;

export const createUpgradeSet = async (upgradeSet: IUpgradeSet): Promise<IUpgradeSet> => {
    return createModel('upgradeSet', upgradeSet);
};

export const searchUpgradeSet = async (filters: IUpgradeSetFilters & IPagination): Promise<ICard[]> => {
    return searchModels('upgradeSet', filters);
};

searchMethods['upgradeSet'] = searchUpgradeSet;

export const deleteUpgradeSet = async (id: ObjectID): Promise<void> => {
    return deleteModel('upgradeSet', id);
};
