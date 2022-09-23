import { createUnion } from "../../util/templateHelper";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBUpgrade, DBUpgradeProps, Upgrade } from "../../db/models/upgrade";
import { TObjectId } from "./helpers/objectId";
import { Abilities, Skills } from "../../db/models/unit";
import { ObjectId } from "mongodb";
import { IScope, mapScopeUpdate, ScopeMap } from "./scope";

const TUpgradeMap = {
    empty: T.Object({}),
    changeLevel: T.Object({ amount: T.Float }),
    changeAbility: T.Object({
        ability: T.Enum(...Abilities),
        amount: T.Int
    }),
    changeSkill: T.Object({
        skill: T.Enum(...Skills),
        amount: T.Int,
        max: T.Int
    }),
    changeHp: T.Object({ amount: T.Float }),
    changeResource: T.Object({  amount: T.Float, name: T.String, shortName: T.String }),
    changeAC: T.Object({ amount: T.Float }),
    changeHitmod: T.Object({ amount: T.Float }),
    changeMovespeed: T.Object({ amount: T.Float }),
    changeHitDice: T.Object({ dice: T.Any }),
    addAction: T.Object({ actionId: TObjectId }),
    addActionMod: T.Object({ actionModId: TObjectId }),
    addFeature: T.Object({ featureId: TObjectId }),
    addItem: T.Object({ itemId: TObjectId }),
    changeSelectedSkill: T.Object({ chosenSkill: T.Optional(T.Enum(...Skills)), amount: T.Int, max: T.Int }),
    changeSelectedAbility: T.Object({ chosenAbility: T.Optional(T.Enum(...Abilities)), amount: T.Int }),
    selectActionsByTag: T.Object({ actionTags: T.Array(T.String), amount: T.Int, chosenActions: T.Optional(T.Array(TObjectId)) }),
    selectFeaturesByTag: T.Object({ featureTags: T.Array(T.String), amount: T.Int, chosenFeatures: T.Optional(T.Array(TObjectId)) }),
    selectUpgradeSetById: T.Object({ upgradeSets: T.Array(TObjectId), amount: T.Int, chosenUpgradeSets: T.Optional(T.Array(TObjectId)) }),
    selectActionToUpgrade: T.Object({ actionTags: T.Array(T.String), actionModId: TObjectId, chosenAction: T.Optional(T.Array(TObjectId)) }),
    
} as const;
export type UpgradeType = keyof typeof TUpgradeMap
export type IUpgrade<T extends UpgradeType> = {
    id?: ObjectId;
    type: T;
    data: ModelType<(typeof TUpgradeMap)[T]>;
    scope: IScope;
};
export const TUpgrade: Template<IUpgrade<UpgradeType>, any> = createUnion(TUpgradeMap);
export const TPartialUpgrade = T.toPartial(TUpgrade);

const mapToApi = (upgrade: DBUpgrade): IUpgrade<UpgradeType> => {
    return {
        id: upgrade._id,
        type: upgrade.type,
        data: upgrade.data,
        scope: ScopeMap.toTransit(upgrade.scope)
    }
};

const mapToDb = (upgrade: IUpgrade<UpgradeType>): DBUpgrade => {
    return new Upgrade({
        _id: upgrade.id,
        type: upgrade.type,
        data: upgrade.data,
        scope: ScopeMap.toModel(upgrade.scope)
    });
}

export const UpgradeMap: Template<DBUpgrade, IUpgrade<UpgradeType>> = {
    valid: (t: any): t is IUpgrade<UpgradeType> => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapUpgradeUpdate = (upgrade: DeepPartial<IUpgrade<UpgradeType>> | undefined): DeepPartial<DBUpgradeProps> | undefined => {
    return upgrade === undefined ? undefined : {
        type: upgrade.type,
        data: upgrade.data,
        scope: mapScopeUpdate(upgrade.scope)
    };
};
