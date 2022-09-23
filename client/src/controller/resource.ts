import type { ObjectID } from "../models/objectId";
import type { IResource } from "../models/resource";
import type { IScope } from "../models/scope";
import { createResource, loadResources } from "../repo/resource";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods } from "./model";

export const loadAndStoreResourceModels = async (resources: IResource[]) => {
    resources.map(resource => idStore.set('resource', resource));
}

export const loadAndStoreResources = async (resourceIds: ObjectID[]) => {
    const resources = await loadResources(resourceIds);
    await loadAndStoreResourceModels(resources);
};

export const ensureResourcesInStore = async (resourceIds: ObjectID[]) => {
    const missingIds = resourceIds.filter(id => !idStore.hasModel('resource', id));
    if (missingIds.length > 0) {
        await loadAndStoreResources(unique(missingIds));
    }
};

ensureMethods['resource'] = ensureResourcesInStore;

export const createAndStoreResource = async (resource: IResource) => {
    const createdResource = await createResource(resource);
    await loadAndStoreResourceModels([createdResource]);
    return createdResource;
}

createAndStoreMethods['resource'] = createAndStoreResource;

export const createResourceBaseDefaults = async (resource: IResource, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['resource'] = createResourceBaseDefaults;
