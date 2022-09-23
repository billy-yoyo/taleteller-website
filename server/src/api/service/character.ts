import { ObjectId } from "mongodb";
import { Character, DBCharacter } from "../../db/models/character";
import { CharacterMap, getCharacterFilterQuery, mapCharacterUpdate, TCharacter, TCharacterFilters, TPartialCharacter } from "../models/character";
import { TObjectId } from "../models/helpers/objectId";
import { getActionModelResponseByIds } from "./action";
import { getFeatureModelResponseByIds } from "./feature";
import { getItemModelResponseByIds } from "./item";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { getResourceModelResponseByIds } from "./resource";
import { getUpgradeSetModelResponseByIds } from "./upgradeSet";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelSearcher } from "./lib/searcher";
import { modelDeleter } from "./lib/deleter";

export const getCharacterModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('character', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const characters = await Character.find({ _id: { $in: filteredIds } });
        return await Promise.all(characters.map(character => getCharacterModelResponse(character, parent)));
    } else {
        return [];
    }
};

export const getCharacterModelResponse = async (character: DBCharacter, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('character', TCharacter.toTransit(CharacterMap.toTransit(character)), parent);

    const resources = await getResourceModelResponseByIds(character.resources, response);
    response.addAllChildren(resources);

    const actions = await getActionModelResponseByIds(character.actions, response);
    response.addAllChildren(actions);

    const items = await getItemModelResponseByIds(character.items, response);
    response.addAllChildren(items);

    const features = await getFeatureModelResponseByIds(character.features, response);
    response.addAllChildren(features);

    const upgradeSets = await getUpgradeSetModelResponseByIds(character.upgradeSets, response);
    response.addAllChildren(upgradeSets);

    return response;
};

export const getCharacters = modelGetter(getCharacterModelResponseByIds);
export const createCharacter = modelCreator(TCharacter, CharacterMap);
export const updateCharacter = modelUpdater(TPartialCharacter, Character, mapCharacterUpdate);
export const searchCharacters = modelSearcher(TCharacterFilters, getCharacterFilterQuery, Character, 'character')
export const deleteCharacter = modelDeleter(Character);
