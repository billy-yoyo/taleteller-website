import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import type { IUpgradeSet } from "../models/upgradeSet";
import { createUpgradeSet, loadUpgradeSets } from "../repo/upgradeSet";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreCopyById, createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";
import { ensureUpgradesInStore } from "./upgrade";

export const loadAndStoreUpgradeSetModels = async (upgradeSets: IUpgradeSet[]) => {
    upgradeSets.map(upgradeSet => idStore.set('upgradeSet', upgradeSet));

    await ensureUpgradesInStore(upgradeSets.map(us => us.upgrades).flat());
};

export const loadAndStoreUpgradeSets = async (upgradeSetIds: ObjectID[]) => {
    const upgradeSets = await loadUpgradeSets(upgradeSetIds);
    await loadAndStoreUpgradeSetModels(upgradeSets);
};

export const ensureUpgradeSetsInStore = async (upgradeSetIds: ObjectID[]) => {
    const missingIds = upgradeSetIds.filter(id => !idStore.hasModel('upgradeSet', id));
    if (missingIds.length > 0) {
        await loadAndStoreUpgradeSets(unique(missingIds));
    }
};

ensureMethods['upgradeSet'] = ensureUpgradeSetsInStore;

export const createAndStoreUpgradeSet = async (upgradeSet: IUpgradeSet): Promise<IUpgradeSet> => {
    const createdUpgradeSet = await createUpgradeSet(upgradeSet);
    await loadAndStoreUpgradeSetModels([createdUpgradeSet]);
    return createdUpgradeSet;
}

createAndStoreMethods['upgradeSet'] = createAndStoreUpgradeSet;

export const createUpgradeSetBaseDefaults = async (upgradeSet: IUpgradeSet, scope?: IScope) => {
    const upgrades = await Promise.all(upgradeSet.upgrades.map(uid => createAndStoreCopyById('upgrade', uid, {}, scope)));

    return {
        upgrades: upgrades.map(u => u.id)
    };
};

createBaseDefaultsMethods['upgradeSet'] = createUpgradeSetBaseDefaults;
