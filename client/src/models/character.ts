import type { ObjectID } from "./objectId";
import { createDefaultUnit, IUnit } from "./unit";
import * as me from "../store/me";
import { get } from "svelte/store";
import type { Value, ValueType } from "../rolling/rollast";

export interface ICharacter extends IUnit {
    id: ObjectID;
    owner: ObjectID;
    type: 'character';

    name: string;
    level: number;
    race: string;
    hitDice: Value<ValueType> | undefined;

    features: ObjectID[];
    items: ObjectID[];
    actions: ObjectID[];
    upgradeSets: ObjectID[];
    classes: ObjectID[];

    money: number
}

export interface ICharacterFilters {}

export const createDefaultCharacter = (defaults: Partial<ICharacter>): ICharacter => ({
    ...createDefaultUnit(),
    owner: get(me.user)?.id ?? "",
    type: 'character',
    name: 'Character',
    level: 0,
    race: '',
    hitDice: undefined,
    classes: [],
    features: [],
    items: [],
    actions: [],
    actionMods: [],
    upgradeSets: [],
    money: 0,
    ...defaults
});
