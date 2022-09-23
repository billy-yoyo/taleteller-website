import type { Value, ValueType } from "../rolling/rollast";
import { optionsFromNameMap } from "../util/funcHelpers";
import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";
import type { Ability, Skill } from "./unit";


export interface UpgradeTypeMap {
    empty: {},
    changeLevel: {
        amount: number
    },
    changeAbility: {
        ability: Ability;
        amount: number;
    },
    changeSkill: {
        skill: Skill;
        amount: number;
        max: number;
    },
    changeHp: {
        amount: number;
    },
    changeResource: {
        name: string;
        shortName: string;
        amount: number;
    },
    changeAC: {
        amount: number;
    },
    changeHitmod: {
        amount: number;
    },
    changeMovespeed: {
        amount: number;
    },
    changeHitDice: {
        dice: Value<ValueType>
    },
    addAction: {
        actionId: ObjectID;
    },
    addActionMod: {
        actionModId: ObjectID;
    },
    addFeature: {
        featureId: ObjectID;
    },
    addItem: {
        itemId: ObjectID;
    },
    changeSelectedSkill: {
        chosenSkill: Skill | undefined;
        amount: number;
        max: number;
    },
    changeSelectedAbility: {
        chosenAbility: Ability | undefined;
        amount: number;
    },
    selectActionsByTag: {
        actionTags: string[];
        amount: number;
        chosenActions: ObjectID[] | undefined;
    },
    selectFeaturesByTag: {
        featureTags: string[];
        amount: number;
        chosenFeatures: ObjectID[] | undefined;
    },
    selectUpgradeSetById: {
        upgradeSets: ObjectID[];
        amount: number;
        chosenUpgradeSets: ObjectID[] | undefined;
    },
    selectActionToUpgrade: {
        actionTags: string[];
        actionModId: ObjectID;
        chosenAction: ObjectID | undefined;
    }
}
export type UpgradeType = keyof UpgradeTypeMap;
export type UpgradeValues<T extends UpgradeType> = UpgradeTypeMap[T];

export const isUpgradeType = <T extends UpgradeType>(upgrade: IUpgrade<UpgradeType>, type: T): upgrade is IUpgrade<T> => {
    return upgrade.type === type;
};

const UpgradeTypeNames: {[type in UpgradeType]: string} = {
    empty: 'Empty',
    changeLevel: 'Change Level',
    changeAbility: 'Change Ability',
    changeAC: 'Change Armour Class',
    changeHitmod: 'Change Hit Mod',
    changeHp: 'Change Max Health',
    changeMovespeed: 'Change Movespeed',
    changeResource: 'Change Resource Max',
    changeSkill: 'Change Skill',
    changeHitDice: 'Change Hit Dice',
    addAction: 'Add Action',
    addActionMod: 'Add Action Mod',
    addFeature: 'Add Feature',
    addItem: 'Add Item',
    changeSelectedSkill: 'Change Selected Skill',
    changeSelectedAbility: 'Change Selected Ability',
    selectActionsByTag: 'Select Actions (By Tag)',
    selectFeaturesByTag: 'Select Features (By Tag)',
    selectUpgradeSetById: 'Select Upgrade Set (By ID)',
    selectActionToUpgrade: 'Upgrade Action'
};
export const UpgradeTypeOptions = optionsFromNameMap(UpgradeTypeNames);

/**
 * Represents a character upgrade from any source (e.g. level up, background)
 */
 export interface IUpgrade<T extends UpgradeType> {
    id: ObjectID;
    type: T;
    data: UpgradeValues<T>;
    scope: IScope;
}

export const createDefaultUpgrade = (defaults: Partial<IUpgrade<UpgradeType>>, scope: IScope): IUpgrade<UpgradeType> => ({
    id: undefined,
    type: 'empty',
    data: {},
    scope,
    ...defaults
});
