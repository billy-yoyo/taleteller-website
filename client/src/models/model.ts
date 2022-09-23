import { createDefaultAction, IAction, IActionFilters } from "./action";
import { createDefaultActionMod, IActionMod } from "./actionMod";
import { createDefaultCampaign, ICampaign, ICampaignFilters } from "./campaign";
import { createDefaultChannel, IChannel } from "./channel";
import { createDefaultCharacter, ICharacter, ICharacterFilters } from "./character";
import { createDefaultClass, IClass, IClassFilters } from "./class";
import { ConditionType, createDefaultCondition, ICondition } from "./condition";
import { createDefaultEffect, EffectType, IEffect } from "./effect";
import { createDefaultFeature, IFeature, IFeatureFilters } from "./feature";
import { createDefaultItem, IItem, IItemFilters } from "./item";
import { createDefaultMessage, IMessage } from "./message";
import type { ObjectID } from "./objectId";
import { createDefaultResource, IResource } from "./resource";
import type { IScope } from "./scope";
import { createDefaultUpgrade, IUpgrade, UpgradeType } from "./upgrade";
import { createDefaultUpgradeSet, IUpgradeSet, IUpgradeSetFilters } from "./upgradeSet";
import { createDefaultUser, IUser, IUserFilters } from "./user";

export interface ModelID {
    type: ModelType;
    id: ObjectID;
}

export interface IModel {
    id: ObjectID;
    name: string;
}

interface Models {
    action: IAction;
    actionMod: IActionMod;
    character: ICharacter;
    feature: IFeature;
    item: IItem;
    resource: IResource;
    upgrade: IUpgrade<UpgradeType>;
    upgradeSet: IUpgradeSet;
    effect: IEffect<EffectType>;
    user: IUser;
    campaign: ICampaign;
    condition: ICondition<ConditionType>;
    class: IClass;
    channel: IChannel;
    message: IMessage;
};
export type ModelType = keyof Models;
export type Model<T extends ModelType> = Models[T];

interface ModelFilters {
    action: IActionFilters;
    character: ICharacterFilters;
    item: IItemFilters;
    upgradeSet: IUpgradeSetFilters;
    campaign: ICampaignFilters;
    class: IClassFilters;
    user: IUserFilters;
    feature: IFeatureFilters;
}
export type FilterableModelType = keyof ModelFilters;
export type ModelFilter<T extends FilterableModelType> = ModelFilters[T];

const defaultCreators: {[type in ModelType]: (defaults?: Partial<Model<type>>, scope?: IScope) => Model<type>} = {
    action: createDefaultAction,
    actionMod: createDefaultActionMod,
    character: createDefaultCharacter,
    feature: createDefaultFeature,
    item: createDefaultItem,
    resource: createDefaultResource,
    upgrade: createDefaultUpgrade,
    upgradeSet: createDefaultUpgradeSet,
    effect: createDefaultEffect,
    user: createDefaultUser,
    campaign: createDefaultCampaign,
    condition: createDefaultCondition,
    class: createDefaultClass,
    channel: createDefaultChannel,
    message: createDefaultMessage
};

export const createDefaultModel = <T extends ModelType>(type: T, defaults: Partial<Model<T>>, scope?: IScope): Model<T> => {
    return defaultCreators[type](defaults ?? {}, scope);
};

export const copyModel = <T extends ModelType>(model: Model<T>, defaults: Partial<Model<T>>, scope?: IScope): Model<T> => {
    return { ...model, id: undefined, scope, ...defaults };
};
