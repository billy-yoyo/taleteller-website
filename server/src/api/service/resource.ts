import { ObjectId } from "mongodb";
import { Resource, DBResource } from "../../db/models/resource";
import { mapResourceUpdate, ResourceMap, TPartialResource, TResource } from "../models/resource";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelDeleter } from "./lib/deleter";

export const getResourceModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('resource', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const resources = await Resource.find({ _id: { $in: filteredIds } });
        return await Promise.all(resources.map(resource => getResourceModelResponse(resource, parent)));
    } else {
        return [];
    }
};

export const getResourceModelResponse = async (resource: DBResource, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('resource', TResource.toTransit(ResourceMap.toTransit(resource)), parent);
    return response;
};

export const getResources = modelGetter(getResourceModelResponseByIds);
export const createResource = modelCreator(TResource, ResourceMap);
export const updateResource = modelUpdater(TPartialResource, Resource, mapResourceUpdate);
export const deleteResource = modelDeleter(Resource);
