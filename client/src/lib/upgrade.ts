import { createAndStoreResource } from "../controller/resource";
import type { ICharacter } from "../models/character";
import type { Model, ModelType } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IUpgrade, UpgradeType, UpgradeValues } from "../models/upgrade";
import type { IUpgradeSet } from "../models/upgradeSet";
import { save } from "../repo/model";
import * as idStore from "../store/idStore";
import { deepCopy, groupBy } from "../util/funcHelpers";

interface Upgrader<T extends ModelType> {
    modelType: T;
    modelId: ObjectID;
    modify: (model: Model<T>) => void;
}

const characterModifier = <T extends UpgradeType>(modify: (upgrade: UpgradeValues<T>, character: ICharacter) => void) => {
    return async (upgrade: UpgradeValues<T>, character: ICharacter): Promise<Upgrader<'character'>[]> => {
        return [{
            modelType: 'character',
            modelId: character.id,
            modify: (model) => modify(upgrade, model)
        }]
    };
}

const upgradeAppliers: {[type in UpgradeType]: (upgrade: UpgradeValues<type>, character: ICharacter) => Promise<Upgrader<ModelType>[]>} = {
    changeLevel: characterModifier<'changeLevel'>((upgrade, char) => { char.level += upgrade.amount; }),
    changeAbility: characterModifier<'changeAbility'>((upgrade, char) => { char.abilities[upgrade.ability] += upgrade.amount }),
    changeAC: characterModifier<'changeAC'>((upgrade, char) => { char.armourClass += upgrade.amount }),
    changeHitmod: characterModifier<'changeHitmod'>((upgrade, char) => { char.hitMod += upgrade.amount }),
    changeHp: characterModifier<'changeHp'>((upgrade, char) => { char.maxHealth += upgrade.amount }),
    changeMovespeed: characterModifier<'changeMovespeed'>((upgrade, char) => { char.speed += upgrade.amount }),
    changeHitDice: characterModifier<'changeHitDice'>((upgrade, char) => { char.hitDice = upgrade.dice }),
    changeSkill: characterModifier<'changeSkill'>((upgrade, char) => {
        if (upgrade.max !== undefined) {
            if (char.skills[upgrade.skill] < upgrade.max) {
                if (char.skills[upgrade.skill] + upgrade.amount > upgrade.max) {
                    char.skills[upgrade.skill] = upgrade.max;
                } else {
                    char.skills[upgrade.skill] += upgrade.amount;
                }
            }
        } else {
            char.skills[upgrade.skill] += upgrade.amount;
        }
    }),
    changeResource: async (upgrade, char) => {
        const resources = char.resources.map(rid => idStore.getModel('resource', rid));
        const existingResource = resources.find(r => r.shortName === upgrade.shortName);
        if (existingResource) {
            const resourceUpgrader: Upgrader<'resource'> = {
                modelType: 'resource',
                modelId: existingResource.id,
                modify: (model) => {
                    model.maxAmount += upgrade.amount
                }
            };

            return [resourceUpgrader];
        } else {
            const newResource = await createAndStoreResource({
                id: undefined,
                name: upgrade.name,
                shortName: upgrade.shortName,
                maxAmount: upgrade.amount,
                amount: 0,
                scope: {
                    type: 'character',
                    link: char.id
                }
            });

            const characterUpgrader: Upgrader<'character'> = {
                modelType: 'character',
                modelId: char.id,
                modify: (model) => {
                    model.resources.push(newResource.id)
                }
            };

            return [characterUpgrader];
        }
    },
    addAction: characterModifier<'addAction'>((upgrade, char) => { char.actions.push(upgrade.actionId); }),
    addActionMod: characterModifier<'addActionMod'>((upgrade, char) => { char.actionMods.push(upgrade.actionModId); }),
    addFeature: characterModifier<'addFeature'>((upgrade, char) => { char.features.push(upgrade.featureId); }),
    addItem: characterModifier<'addItem'>((upgrade, char) => { char.items.push(upgrade.itemId); }),
    changeSelectedAbility: characterModifier<'changeSelectedAbility'>((upgrade, char) => { char.abilities[upgrade.chosenAbility] += upgrade.amount; }),
    changeSelectedSkill: characterModifier<'changeSelectedSkill'>((upgrade, char) => { char.skills[upgrade.chosenSkill] += upgrade.amount; }),
    selectActionsByTag: characterModifier<'selectActionsByTag'>((upgrade, char) => { char.actions.push(...upgrade.chosenActions) }),
    selectFeaturesByTag: characterModifier<'selectFeaturesByTag'>((upgrade, char) => { char.features.push(...upgrade.chosenFeatures) }),
    selectUpgradeSetById: characterModifier<'selectUpgradeSetById'>((upgrade, char) => {
        upgrade.chosenUpgradeSets.forEach(upgradeSetId => {
            applyUpgradeSet(char, idStore.getModel('upgradeSet', upgradeSetId))
        });
        char.upgradeSets.push(...upgrade.chosenUpgradeSets);
    }),
    selectActionToUpgrade: characterModifier<'selectActionToUpgrade'>((upgrade, char) => { char.actionMods.push(upgrade.chosenAction) }),
    empty: async () => []
};

const upgradeReverters: {[type in UpgradeType]: (upgrade: UpgradeValues<type>, character: ICharacter) => Promise<Upgrader<ModelType>[]>} = {
    changeLevel: characterModifier<'changeLevel'>((upgrade, char) => { char.level -= upgrade.amount; }),
    changeAbility: characterModifier<'changeAbility'>((upgrade, char) => { char.abilities[upgrade.ability] -= upgrade.amount }),
    changeAC: characterModifier<'changeAC'>((upgrade, char) => { char.armourClass -= upgrade.amount }),
    changeHitmod: characterModifier<'changeHitmod'>((upgrade, char) => { char.hitMod -= upgrade.amount }),
    changeHp: characterModifier<'changeHp'>((upgrade, char) => { char.maxHealth -= upgrade.amount }),
    changeMovespeed: characterModifier<'changeMovespeed'>((upgrade, char) => { char.speed -= upgrade.amount }),
    changeSkill: characterModifier<'changeSkill'>((upgrade, char) => { /* NOTE: this isnt actually correct if max is used */ char.skills[upgrade.skill] -= upgrade.amount }),
    changeHitDice: characterModifier<'changeHitDice'>((upgrade, char) => { /* NOTE: this is not necessarily correct */ char.hitDice = undefined; }),
    changeResource: async (upgrade, char) => {
        const resources = char.resources.map(rid => idStore.getModel('resource', rid));
        const resource = resources.find(r => r.shortName === upgrade.shortName);
        if (!resource) {
            // do nothing, the resource is already missing?
            return [];
        } else {
            if (resource.amount - upgrade.amount <= 0) {
                const characterUpgrader: Upgrader<'character'> = {
                    modelType: 'character',
                    modelId: char.id,
                    modify: (model) => {
                        model.resources.filter(rid => rid !== resource.id)
                    }
                };

                return [characterUpgrader];
            } else {
                const resourceUpgrader: Upgrader<'resource'> = {
                    modelType: 'resource',
                    modelId: resource.id,
                    modify: (model) => {
                        model.maxAmount -= resource.maxAmount;
                        model.amount = Math.min(model.amount, model.maxAmount)
                    }
                };

                return [resourceUpgrader];
            }
        }
    },
    addAction: characterModifier<'addAction'>((upgrade, char) => { char.actions.filter(aid => aid !== upgrade.actionId); }),
    addActionMod: characterModifier<'addActionMod'>((upgrade, char) => { char.actionMods.filter(aid => aid !== upgrade.actionModId) }),
    addFeature: characterModifier<'addFeature'>((upgrade, char) => { char.features.filter(fid => fid !== upgrade.featureId); }),
    addItem: characterModifier<'addItem'>((upgrade, char) => { char.items.filter(iid => iid !== upgrade.itemId); }),
    changeSelectedAbility: characterModifier<'changeSelectedAbility'>((upgrade, char) => { char.abilities[upgrade.chosenAbility] -= upgrade.amount; }),
    changeSelectedSkill: characterModifier<'changeSelectedSkill'>((upgrade, char) => { char.skills[upgrade.chosenSkill] -= upgrade.amount; }),
    selectActionsByTag: characterModifier<'selectActionsByTag'>((upgrade, char) => { char.actions.filter(aid => !upgrade.chosenActions.includes(aid)) }),
    selectFeaturesByTag: characterModifier<'selectFeaturesByTag'>((upgrade, char) => { char.features.filter(aid => !upgrade.chosenFeatures.includes(aid)) }),
    selectUpgradeSetById: characterModifier<'selectUpgradeSetById'>((upgrade, char) => {
        upgrade.chosenUpgradeSets.forEach(upgradeSetId => {
            if (char.upgradeSets.includes(upgradeSetId)) {
                revertUpgradeSet(char, idStore.getModel('upgradeSet', upgradeSetId));
            }
        });
        char.upgradeSets.filter(aid => !upgrade.chosenUpgradeSets.includes(aid))
    }),
    selectActionToUpgrade: characterModifier<'selectActionToUpgrade'>((upgrade, char) => { char.actionMods.filter(aid => aid !== upgrade.chosenAction) }),
    empty: async () => []
};

export const applyUpgrade = <T extends UpgradeType>(character: ICharacter, upgrade: IUpgrade<T>) => {
    return upgradeAppliers[upgrade.type](upgrade.data, character);
};

export const revertUpgrade = <T extends UpgradeType>(character: ICharacter, upgrade: IUpgrade<T>) => {
    return upgradeReverters[upgrade.type](upgrade.data, character);
};

const executeUpgraders = async (upgraders: Upgrader<ModelType>[], dontSaveTypes: string[] = []): Promise<void> => {
    const typeGroups = groupBy(upgraders, u => u.modelType);
    const savePromises = Object.values(typeGroups).map(typeGroup => {
        const idGroups = groupBy(typeGroup, u => `${u.modelId}`);
        return Object.values(idGroups).map(idGroup => {
            const type = idGroup[0].modelType;
            const id = idGroup[0].modelId;

            if (!dontSaveTypes.includes(type)) {
                idStore.startEditing(type, id);
            }

            idStore.update(type, id, (model) => {
                const newModel = deepCopy(model);
                idGroup.forEach(upgrader => upgrader.modify(newModel));
                return newModel;
            }, true);

            if (!dontSaveTypes.includes(type)) {
                return idStore.finishEditing(type, id);
            } else {
                return Promise.resolve();
            }
        });
    }).flat();

    await Promise.all(savePromises);
}

export const applyUpgradeSet = async (character: ICharacter, upgradeSet: IUpgradeSet, dontSaveTypes: string[] = []) => {
    const upgraders = (await Promise.all(upgradeSet.upgrades.map(upgrade => applyUpgrade(character, idStore.getModel('upgrade', upgrade))))).flat();
    await executeUpgraders(upgraders, dontSaveTypes);
};

export const revertUpgradeSet = async (character: ICharacter, upgradeSet: IUpgradeSet, dontSaveTypes: string[] = []) => {
    const upgraders = (await Promise.all(upgradeSet.upgrades.map(upgrade => revertUpgrade(character, idStore.getModel('upgrade', upgrade))))).flat();
    await executeUpgraders(upgraders, dontSaveTypes);
};

