import { Abilities, Skills } from "../../db/models/unit";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBCharacter, Character, DBCharacterProps } from "../../db/models/character";
import { TObjectId } from "./helpers/objectId";
import { FilterQuery } from "mongoose";

export const TCharacter = T.Object({
    id: T.Optional(TObjectId),
    type: T.String,
    owner: TObjectId,
    
    health: T.Float,
    maxHealth: T.Float,
    tempHealth: T.Float,
    
    armourClass: T.Int,
    speed: T.Int,
    hitMod: T.Int,
    equipLoadMod: T.Int,
    hitDice: T.Any,

    skills: T.EnumRecord(Skills, T.Int),
    abilities: T.EnumRecord(Abilities, T.Int),

    name: T.String,
    level: T.Int,
    race: T.String,
    
    resources: T.Array(TObjectId),
    features: T.Array(TObjectId),
    items: T.Array(TObjectId),
    actions: T.Array(TObjectId),
    upgradeSets: T.Array(TObjectId),
    classes: T.Array(TObjectId),
    actionMods: T.Array(TObjectId),

    money: T.Float
});
export const TPartialCharacter = T.toPartial(TCharacter);
export type ICharacter = ModelType<typeof TCharacter>;

export const TCharacterFilters = T.Object({
    owner: T.Optional(TObjectId)
});
export type ICharacterFilters = ModelType<typeof TCharacterFilters>;

const mapToApi = (character: DBCharacter): ICharacter => {
    return {
        id: character._id,
        type: character.type,
        owner: character.owner,
        health: character.health,
        maxHealth: character.maxHealth,
        tempHealth: character.tempHealth,
        armourClass: character.armourClass,
        speed: character.speed,
        hitMod: character.hitMod,
        hitDice: character.hitDice,
        equipLoadMod: character.equipLoadMod,
        skills: character.skills,
        abilities: character.abilities,
        name: character.name,
        level: character.level,
        race: character.race,
        classes: character.classes,
        resources: character.resources,
        features: character.features,
        items: character.items,
        actions: character.actions,
        actionMods: character.actionMods,
        upgradeSets: character.upgradeSets,
        money: character.money
    }
};

const mapToDb = (character: ICharacter): DBCharacter => {
    return new Character({
        _id: character.id,
        type: character.type,
        owner: character.owner,
        health: character.health,
        maxHealth: character.maxHealth,
        tempHealth: character.tempHealth,
        armourClass: character.armourClass,
        speed: character.speed,
        hitMod: character.hitMod,
        hitDice: character.hitDice,
        equipLoadMod: character.equipLoadMod,
        skills: character.skills,
        abilities: character.abilities,
        name: character.name,
        level: character.level,
        race: character.race,
        classes: character.classes,
        resources: character.resources,
        features: character.features,
        items: character.items,
        actions: character.actions,
        actionMods: character.actionMods,
        upgradeSets: character.upgradeSets,
        money: character.money
    });
}

export const CharacterMap: Template<DBCharacter, ICharacter> = {
    valid: (t: any): t is ICharacter => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapCharacterUpdate = (character: DeepPartial<ICharacter> | undefined): DeepPartial<DBCharacterProps> | undefined => {
    return character === undefined ? undefined : {
        type: character.type,
        owner: character.owner,
        health: character.health,
        maxHealth: character.maxHealth,
        tempHealth: character.tempHealth,
        armourClass: character.armourClass,
        speed: character.speed,
        hitMod: character.hitMod,
        hitDice: character.hitDice,
        equipLoadMod: character.equipLoadMod,
        skills: character.skills,
        abilities: character.abilities,
        name: character.name,
        level: character.level,
        race: character.race,
        classes: character.classes,
        resources: character.resources,
        features: character.features,
        items: character.items,
        actions: character.actions,
        actionMods: character.actionMods,
        upgradeSets: character.upgradeSets,
        money: character.money
    }
}; 

const getOwnerFilter = (filters: ICharacterFilters): FilterQuery<DBCharacter> => {
    return filters.owner === undefined ? {} : {
        owner: filters.owner
    }
};

export const getCharacterFilterQuery = (filters: ICharacterFilters): FilterQuery<DBCharacter> => {
    return {
        ...getOwnerFilter(filters)
    }
};
