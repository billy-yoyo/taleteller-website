import type { IResource } from "../models/resource";
import type { ObjectID } from "../models/objectId";
import { createModel, deleteModel, fetchModels, updateModel } from "./lib/modelFetch";
import { saveMethods } from "./model";

export const loadResources = async(ids: ObjectID[]): Promise<IResource[]> => {
    return fetchModels('resource', ids);
}

export const saveResource = async (resource: Partial<IResource> & { id: ObjectID }): Promise<void> => {
    return updateModel('resource', resource.id, resource);
};

saveMethods['resource'] = saveResource;

export const createResource = async (resource: IResource): Promise<IResource> => {
    return createModel('resource', resource);
};

export const deleteResource = async (id: ObjectID): Promise<void> => {
    return deleteModel('resource', id);
};
