import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document} from 'mongoose';
import { Abilities, Ability, Skill, Skills } from './unit';

export interface DBCharacterProps {
    type: string;
    owner: ObjectId;
    name: string;

    health: number;
    maxHealth: number;
    tempHealth: number;

    armourClass: number;
    speed: number;
    hitMod: number;
    equipLoadMod: number;

    skills: Record<Skill, number>;
    abilities: Record<Ability, number>;
    resources: ObjectId[];

    level: number;
    race: string;
    hitDice?: any | undefined;

    features: ObjectId[];
    items: ObjectId[];
    actions: ObjectId[];
    actionMods: ObjectId[];
    upgradeSets: ObjectId[];
    classes: ObjectId[];

    money: number;
}

export type DBCharacter = Document & DBCharacterProps;

const CharacterSchema: Schema = new Schema({
    type: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    health: { type: Number, required: true },
    maxHealth: { type: Number, required: true },
    tempHealth: { type: Number, required: true },
    armourClass: { type: Number, required: true },
    speed: { type: Number, required: true },
    hitMod: { type: Number, required: true },
    hitDice: { type: Schema.Types.Mixed, required: false },
    equipLoadMod: { type: Number, required: true },
    skills: { type: Schema.Types.Mixed, required: true },
    abilities: { type: Schema.Types.Mixed, required: true },
    resources: { type: [Schema.Types.ObjectId], required: true },
    level: { type: Number, required: true },
    race: { type: String, required: true },
    features: { type: [Schema.Types.ObjectId], required: true },
    items: { type: [Schema.Types.ObjectId], required: true },
    actions: { type: [Schema.Types.ObjectId], required: true },
    actionMods: { type: [Schema.Types.ObjectId], required: true },
    upgradeSets: { type: [Schema.Types.ObjectId], required: true },
    classes: { type: [Schema.Types.ObjectId], required: true },
    money: { type: Number, required: true }
});

export const Character = mongoose.model<DBCharacter>('character', CharacterSchema);


