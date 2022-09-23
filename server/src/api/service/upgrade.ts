import { ObjectId } from "mongodb";
import { DBUpgrade, Upgrade } from "../../db/models/upgrade";
import { UpgradeMap, TUpgrade, TPartialUpgrade, mapUpgradeUpdate } from "../models/upgrade";
import { TObjectId } from "../models/helpers/objectId";
import { getActionModelResponseByIds } from "./action";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { getFeatureModelResponseByIds } from "./feature";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelDeleter } from "./lib/deleter";

export const getUpgradeModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('upgrade', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const upgrades = await Upgrade.find({ _id: { $in: filteredIds } });
        return await Promise.all(upgrades.map(upgrade => getUpgradeModelResponse(upgrade, parent)));
    } else {
        return [];
    }
};

export const getUpgradeModelResponse = async (upgrade: DBUpgrade, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('upgrade', TUpgrade.toTransit(UpgradeMap.toTransit(upgrade)), parent);
    
    if (upgrade.type === "addAction") {
        const children = await getActionModelResponseByIds([upgrade.data.actionId], response);
        response.addAllChildren(children);
    } else if (upgrade.type === "addFeature") {
        const children = await getFeatureModelResponseByIds([upgrade.data.featureId], response);
        response.addAllChildren(children); 
    } else if (upgrade.type === "addItem") {
        const children = await getUpgradeModelResponseByIds([upgrade.data.itemId], response);
        response.addAllChildren(children);
    }

    return response;
};

export const getUpgrades = modelGetter(getUpgradeModelResponseByIds);
export const createUpgrade = modelCreator(TUpgrade, UpgradeMap);
export const updateUpgrade = modelUpdater(TPartialUpgrade, Upgrade, mapUpgradeUpdate);
export const deleteUpgrade = modelDeleter(Upgrade);
