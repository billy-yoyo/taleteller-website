import type { ObjectID } from "./objectId";

export const Abilities = ["agility", "might", "charisma", "intelligence"] as const;
export type Ability = (typeof Abilities)[number];

export const SkillsToAbilities = {
    arcana: ["intelligence"],
    athletics: ["agility", "might"],
    deception: ["charisma"],
    diplomacy: ["charisma"],
    history: ["intelligence"],
    insight: ["intelligence"],
    intimidation: ["charisma"],
    investigation: ["intelligence"],
    nature: ["intelligence"],
    perception: ["intelligence"],
    religion: ["intelligence"],
    slight_of_hand: ["agility"],
    stealth: ["agility"],
    survival: ["intelligence"]
} as const;
export type Skill = keyof (typeof SkillsToAbilities); 
export const Skills = Object.keys(SkillsToAbilities) as Skill[];

export type UnitType = "character";

export interface UnitID {
    id: ObjectID;
    type: UnitType;
}

export interface IUnit {
    id: ObjectID;
    type: UnitType;

    health: number;
    maxHealth: number;
    tempHealth: number;

    armourClass: number;
    speed: number;
    hitMod: number;
    equipLoadMod: number;
    actionMods: ObjectID[];

    skills: {[name in Skill]: number};
    abilities: {[name in Ability]: number};
    resources: ObjectID[];
}

export const createDefaultUnit = (): IUnit => ({
    id: undefined,
    type: 'character',
    health: 0,
    maxHealth: 0,
    tempHealth: 0,
    armourClass: 0,
    speed: 0,
    hitMod: 0,
    equipLoadMod: 0,
    skills: Object.fromEntries(Skills.map(s => [s, 0])) as {[name in Skill]: number},
    abilities: Object.fromEntries(Abilities.map(a => [a, 0])) as {[name in Ability]: number},
    actionMods: [],
    resources: []
});
