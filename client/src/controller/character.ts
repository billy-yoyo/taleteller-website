import type { ICharacter } from "../models/character";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createCharacter, loadCharacters } from "../repo/character";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureActionsInStore } from "./action";
import { ensureClassesInStore } from "./class";
import { ensureFeaturesInStore } from "./feature";
import { ensureItemsInStore } from "./item";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";
import { ensureResourcesInStore } from "./resource";
import { ensureUpgradeSetsInStore } from "./upgradeSet";

export const loadAndStoreCharacterModels = async (characters: ICharacter[]) => {
    characters.map(character => idStore.set('character', character));
    
    await ensureActionsInStore(characters.map(c => c.actions).flat());
    await ensureFeaturesInStore(characters.map(c => c.features).flat());
    await ensureItemsInStore(characters.map(c => c.items).flat());
    await ensureResourcesInStore(characters.map(c => c.resources).flat());
    await ensureUpgradeSetsInStore(characters.map(c => c.upgradeSets).flat());
    await ensureClassesInStore(characters.map(c => c.classes).flat());
}

export const loadAndStoreCharacters = async (characterIds: ObjectID[]) => {
    const characters = await loadCharacters(characterIds);
    await loadAndStoreCharacterModels(characters);
};

export const ensureCharactersInStore = async (characterIds: ObjectID[]) => {
    const missingIds = characterIds.filter(id => !idStore.hasModel('character', id));
    if (missingIds.length > 0) {
        await loadAndStoreCharacters(unique(missingIds));
    }
};

ensureMethods['character'] = ensureCharactersInStore;

export const createAndStoreCharacter = async (character: ICharacter) => {
    const createdCharacter = await createCharacter(character);
    await loadAndStoreCharacterModels([createdCharacter]);
    return createdCharacter;
};

createAndStoreMethods['character'] = createAndStoreCharacter;

export const createCharacterBaseDefaults = async (character: ICharacter, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['character'] = createCharacterBaseDefaults;
