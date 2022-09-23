import type { ICharacter, ICharacterFilters } from "../models/character";
import type { ICard } from "../models/card";
import type { ObjectID } from "../models/objectId";
import type { IPagination } from "../models/pagination";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods, searchMethods } from "./model";

export const loadCharacters = async (ids: ObjectID[]): Promise<ICharacter[]> => {
    return fetchModels('character', ids);
};

export const saveCharacter = async (character: Partial<ICharacter> & { id: ObjectID }): Promise<void> => {
    return updateModel('character', character.id, character);
};

saveMethods['character'] = saveCharacter;

export const createCharacter = async (character: ICharacter): Promise<ICharacter> => {
    return createModel('character', character);
};

export const searchCharacter = async (filters: ICharacterFilters & IPagination): Promise<ICard[]> => {
    return searchModels('character', filters);
};

searchMethods['character'] = searchCharacter;

export const deleteCharacter = async (id: ObjectID): Promise<void> => {
    return deleteModel('character', id);
};
