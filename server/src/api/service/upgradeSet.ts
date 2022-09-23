import { ObjectId } from "mongodb";
import { UpgradeSet, DBUpgradeSet } from "../../db/models/upgradeSet";
import { UpgradeSetMap, TUpgradeSet, TPartialUpgradeSet, mapUpgradeSetUpdate, TUpgradeSetFilters, getUpgradeSetFilterQuery } from "../models/upgradeSet";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { getUpgradeModelResponseByIds } from "./upgrade";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelSearcher } from "./lib/searcher";
import { modelDeleter } from "./lib/deleter";

export const getUpgradeSetModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('upgradeSet', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const upgradeSets = await UpgradeSet.find({ _id: { $in: filteredIds } });
        return await Promise.all(upgradeSets.map(upgradeSet => getUpgradeSetModelResponse(upgradeSet, parent)));
    } else {
        return [];
    }
};

export const getUpgradeSetModelResponse = async (upgradeSet: DBUpgradeSet, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('upgradeSet', TUpgradeSet.toTransit(UpgradeSetMap.toTransit(upgradeSet)), parent);
    
    const children = await getUpgradeModelResponseByIds(upgradeSet.upgrades, response);
    response.addAllChildren(children);
    
    return response;
};

export const getUpgradeSets = modelGetter(getUpgradeSetModelResponseByIds);
export const createUpgradeSet = modelCreator(TUpgradeSet, UpgradeSetMap);
export const updateUpgradeSet = modelUpdater(TPartialUpgradeSet, UpgradeSet, mapUpgradeSetUpdate);
export const searchUpgradeSets = modelSearcher(TUpgradeSetFilters, getUpgradeSetFilterQuery, UpgradeSet, "upgradeSet");
export const deleteUpgradeSet = modelDeleter(UpgradeSet);
