import type { ModelID } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import type { IUpgrade, UpgradeType, UpgradeValues } from "../models/upgrade";
import { createUpgrade, loadUpgrades } from "../repo/upgrade";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreCopyById, createAndStoreMethods, createBaseDefaultsMethods, ensureMethods, ensureModelsInStore } from "./model";

const subModelUpgradeMapper: {[type in UpgradeType]: (upgrade: IUpgrade<type>) => ModelID[]} = {
    empty: () => [],
    changeLevel: () => [],
    changeAbility: () => [],
    changeAC: () => [],
    changeHitmod: () => [],
    changeHp: () => [],
    changeMovespeed: () => [],
    changeResource: () => [],
    changeSkill: () => [],
    changeHitDice: () => [],
    addAction: (upgrade) => [{ type: 'action', id: upgrade.data.actionId }],
    addActionMod: (upgrade) => [{ type: 'actionMod', id: upgrade.data.actionModId }],
    addFeature: (upgrade) => [{ type: 'feature', id: upgrade.data.featureId }],
    addItem: (upgrade) => [{ type: 'item', id: upgrade.data.itemId }],
    changeSelectedAbility: () => [],
    changeSelectedSkill: () => [],
    selectActionsByTag: (upgrade) => upgrade.data.chosenActions == undefined ? [] : upgrade.data.chosenActions.map(id => ({ type: 'action', id })),
    selectFeaturesByTag: (upgrade) => upgrade.data.chosenFeatures == undefined ? [] : upgrade.data.chosenFeatures.map(id => ({ type: 'feature', id })),
    selectUpgradeSetById: (upgrade): ModelID[] => {
        const chosen: ModelID[] = upgrade.data.chosenUpgradeSets == undefined ? [] : upgrade.data.chosenUpgradeSets.map(id => ({ type: 'upgradeSet', id }));
        const choices: ModelID[] = upgrade.data.upgradeSets.map(id => ({ type: 'upgradeSet', id }));

        return [ ...chosen, ...choices ];
    },
    selectActionToUpgrade: (upgrade) => {
        const chosen: ModelID[] = upgrade.data.chosenAction == undefined ? [] : [{ type: 'action', id: upgrade.data.chosenAction }];

        return [ { type: 'actionMod', id: upgrade.data.actionModId }, ...chosen ];
    },
};

const getSubModels = <T extends UpgradeType>(upgrade: IUpgrade<T>): ModelID[] => {
    return subModelUpgradeMapper[upgrade.type](upgrade);
}

export const loadAndStoreUpgradeModels = async (upgrades: IUpgrade<UpgradeType>[]) => {
    upgrades.map(upgrade => idStore.set('upgrade', upgrade));

    const subModels: ModelID[] = upgrades.map(getSubModels).flat();
    await ensureModelsInStore(subModels);
}

export const loadAndStoreUpgrades = async (upgradeIds: ObjectID[]) => {
    const upgrades = await loadUpgrades(upgradeIds);
    await loadAndStoreUpgradeModels(upgrades);
};

export const ensureUpgradesInStore = async (upgradeIds: ObjectID[]) => {
    const missingIds = upgradeIds.filter(id => !idStore.hasModel('upgrade', id));
    if (missingIds.length > 0) {
        await loadAndStoreUpgrades(unique(missingIds));
    }
};

ensureMethods['upgrade'] = ensureUpgradesInStore;

export const createAndStoreUpgrade = async <T extends UpgradeType>(upgrade: IUpgrade<T>): Promise<IUpgrade<T>> => {
    const createdUpgrade = await createUpgrade(upgrade);
    await loadAndStoreUpgradeModels([createdUpgrade]);
    return createdUpgrade;
};

createAndStoreMethods['upgrade'] = createAndStoreUpgrade;

const upgradeBaseDefaultsMapper: {[type in UpgradeType]: (effect: IUpgrade<type>, scope?: IScope) => Promise<Partial<UpgradeValues<type>>>} = {
    empty: async () => ({}),
    changeLevel: async () => ({}),
    changeAbility: async () => ({}),
    changeAC: async () => ({}),
    changeHitmod: async () => ({}),
    changeHp: async () => ({}),
    changeMovespeed: async () => ({}),
    changeResource: async () => ({}),
    changeSkill: async () => ({}),
    changeHitDice: async () => ({}),
    addAction: async (upgrade, scope) => {
        const action = await createAndStoreCopyById('action', upgrade.data.actionId, {}, scope);
        return {
            actionId: action.id
        }
    },
    addActionMod: async (upgrade, scope) => {
        const actionMod = await createAndStoreCopyById('actionMod', upgrade.data.actionModId, {}, scope);
        return {
            actionModId: actionMod.id
        }
    },
    addFeature: async (upgrade, scope) => {
        const feature = await createAndStoreCopyById('feature', upgrade.data.featureId, {}, scope);
        return {
            featureId: feature.id
        }
    },
    addItem: async (upgrade, scope) => {
        const item = await createAndStoreCopyById('item', upgrade.data.itemId, {}, scope);
        return {
            itemId: item.id
        }
    },
    changeSelectedAbility: async () => ({}),
    changeSelectedSkill: async () => ({}),
    selectActionsByTag: async (upgrade, scope) => {
        if (upgrade.data.chosenActions) {
            const chosenActions = await Promise.all(upgrade.data.chosenActions.map(aid => createAndStoreCopyById('action', aid, {}, scope)));
            return {
                chosenActions: chosenActions.map(a => a.id)
            };
        } else {
            return {};
        }
    },
    selectFeaturesByTag: async (upgrade, scope) => {
        if (upgrade.data.chosenFeatures) {
            const chosenFeatures = await Promise.all(upgrade.data.chosenFeatures.map(fid => createAndStoreCopyById('feature', fid, {}, scope)));
            return {
                chosenFeatures: chosenFeatures.map(f => f.id)
            };
        } else {
            return {};
        }
    },
    selectUpgradeSetById: async (upgrade, scope) => {
        if (upgrade.data.chosenUpgradeSets) {
            const chosenUpgradeSets = await Promise.all(upgrade.data.chosenUpgradeSets.map(usid => createAndStoreCopyById('upgradeSet', usid, {}, scope)));
            return {
                chosenUpgradeSets: chosenUpgradeSets.map(us => us.id)
            };
        } else {
            return {};
        }
    },
    selectActionToUpgrade: async (upgrade, scope) => {
        const actionMod = await createAndStoreCopyById('actionMod', upgrade.data.actionModId, {}, scope);
        if (upgrade.data.chosenAction) {
            const chosenAction = await createAndStoreCopyById('action', upgrade.data.chosenAction, {}, scope);
            return {
                actionModId: actionMod.id,
                chosenAction: chosenAction.id
            };
        } else {
            return {
                actionModId: actionMod.id
            };
        }
    }
};

export const createUpgradeBaseDefaults = async <T extends UpgradeType>(upgrade: IUpgrade<T>, scope?: IScope) => {
    const dataDefaults = await upgradeBaseDefaultsMapper[upgrade.type](upgrade, scope);
    return {
        data: {
            ...upgrade.data,
            ...dataDefaults
        }
    };
};

createBaseDefaultsMethods['upgrade'] = createUpgradeBaseDefaults;
