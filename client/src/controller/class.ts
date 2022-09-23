import type { IClass } from "../models/class";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createClass, loadClasses } from "../repo/class";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureConditionsInStore } from "./condition";
import { createAndStoreCopyById, createAndStoreDefaultModel, createAndStoreMethods, createBaseDefaultsMethods, defaultDependantSetup, ensureMethods } from "./model";
import { ensureUpgradeSetsInStore } from "./upgradeSet";

export const loadAndStoreClassModels = async (classes: IClass[]) => {
    classes.map($class => idStore.set('class', $class));

    await ensureUpgradeSetsInStore(classes.map(c => c.levels).flat().flat());
    await ensureConditionsInStore(classes.map(c => c.prerequisite));
}

export const loadAndStoreClasses = async (classIds: ObjectID[]) => {
    const classes = await loadClasses(classIds);
    await loadAndStoreClassModels(classes);
};

export const ensureClassesInStore = async (classIds: ObjectID[]) => {
    const missingIds = classIds.filter(id => !idStore.hasModel('class', id));
    if (missingIds.length > 0) {
        await loadAndStoreClasses(unique(missingIds));
    }
};

ensureMethods['class'] = ensureClassesInStore;

export const createAndStoreClass = async ($class: IClass) => {
    const createdClass = await createClass($class);
    await loadAndStoreClassModels([createdClass]);
    return createdClass;
};

createAndStoreMethods['class'] = createAndStoreClass;

export const setupDefaultClassDependants = async (scope: IScope): Promise<Partial<IClass>> => {
    const prerequisite = await createAndStoreDefaultModel('condition', scope);
    return { prerequisite: prerequisite.id };
};

defaultDependantSetup['class'] = setupDefaultClassDependants;

export const createClassBaseDefaults = async ($class: IClass, scope?: IScope) => {
    const prerequisite = await createAndStoreCopyById('condition', $class.prerequisite, {}, scope);
    const levelSets = await Promise.all($class.levels.map(tier => Promise.all(tier.map(us => createAndStoreCopyById('upgradeSet', us, {}, scope)))));
    const levels = levelSets.map(tierSets => tierSets.map(tierSet => tierSet.id)) as [string[], string[], string[], string[], string[]];

    return {
        prerequisite: prerequisite.id,
        levels
    };
};

createBaseDefaultsMethods['class'] = createClassBaseDefaults;
