import { get, derived, writable, Writable } from 'svelte/store';
import { deepCopy, fieldCloneWith, fieldGetter, fieldSetter } from '../util/funcHelpers';
import type { Model, ModelType } from '../models/model';
import { save } from '../repo/model';
import type { ObjectID } from '../models/objectId';

interface ModelStore<T extends ModelType> {
    model: Writable<Model<T>>;
    editorModel?: Writable<Model<T>>;
    locks: Set<string>;
}

export interface Derivation<T extends ModelType> {
    type: T;
    id: ObjectID;
    fields: string[];
    editor?: boolean;
}

const idStore: {[type in ModelType]: {[id: string]: ModelStore<type>}} = {
    action: {},
    actionMod: {},
    character: {},
    feature: {},
    item: {},
    resource: {},
    upgrade: {},
    upgradeSet: {},
    effect: {},
    user: {},
    campaign: {},
    condition: {},
    class: {},
    channel: {}, // UNUSED,
    message: {}  // UNUSED
};

export const lockName = <T extends ModelType>(derivation: Derivation<T>) => {
    return derivation.fields.join('.');
};

export const lock = <T extends ModelType>(derivation: Derivation<T>) => {
    const stored = idStore[derivation.type][derivation.id];
    if (stored) {
        stored.locks = stored.locks.add(lockName(derivation));
    } else {
        throw Error(`Attempted to lock a model which isn't in the store: ${derivation.type} ${derivation.id}`);
    }
};

export const unlock = <T extends ModelType>(derivation: Derivation<T>) => {
    const stored = idStore[derivation.type][derivation.id];
    if (stored) {
        stored.locks.delete(lockName(derivation));
    } else {
        throw Error(`Attempted to unlock a model which isn't in the store: ${derivation.type} ${derivation.id}`);
    }
};

export const isLocked = <T extends ModelType>(derivation: Derivation<T>) => {
    const stored = idStore[derivation.type][derivation.id];
    if (stored) {
        return stored.locks.has(lockName(derivation));
    } else {
        throw Error(`Attempted to check a lock on a model which isn't in the store: ${derivation.type} ${derivation.id}`);
    }
};

export const set = <T extends ModelType>(type: T, model: Model<T>) => {
    const stored = idStore[type][model.id];
    if (stored) {
        stored.model.set(model);
    } else {
        // not sure why this as any is necessary seems like a TS bug
        (idStore[type] as any)[model.id] = {
            model: writable(model),
            locks: new Set(),
        };
    }
};

export const update = <T extends ModelType>(type: T, id: ObjectID, updater: (model: Model<T>) => Model<T>, editor?: boolean) => {
    const stored = idStore[type][id];
    if (stored) {
        (editor ? stored.editorModel : stored.model).update(updater);
    } else {
        throw Error(`Attempted to update a model which isn't in the store: ${type} ${id}`);
    }
};

export const subscribe = <T extends ModelType>(type: T, id: ObjectID, subscriber: (model: Model<T>) => void, editor?: boolean) => {
    const stored = idStore[type][id];
    if (stored) {
        return (editor ? stored.editorModel : stored.model).subscribe(subscriber);
    } else {
        throw Error(`Attempted to subscribe to a model which isn't in the store: ${type} ${id}`);
    }
};

export const subscribeManger = <T extends ModelType>(type: T, initialId: ObjectID, subscriber: (model: Model<T>) => void, editor?: boolean, shouldStartEditing: boolean = true) => {
    let unsub: () => void;
    let lastId: ObjectID = undefined;
    const sub = (id: ObjectID, tempEditor?: boolean) => {
        if (lastId === id) {
            return;
        } else {
            if (unsub) {
                unsub();
            }
            if (tempEditor || editor) {
                if (shouldStartEditing) {
                    startEditing(type, id);
                }
            }
            lastId = id;
            unsub = subscribe(type, id, subscriber, editor);
        }
    };
    sub(initialId);
    return sub;
};

export const deriveIdSet = <T extends ModelType, R>(type: T, ids: ObjectID[], deriver: (values: Model<T>[]) => R) => {
    const stored = ids.map(id => idStore[type][id]);
    if (stored.every(s => s)) {
        return derived(stored.map(s => s.model), deriver);
    } else {
        throw Error(`Attempted to derive an id set which includes at least one model which isn't in the store: ${type} ${ids}`);
    }
};

export const derive = <T extends ModelType>(derivation: Derivation<T>) => {
    const stored = idStore[derivation.type][derivation.id];
    if (stored) {
        return derived(derivation.editor ? stored.editorModel : stored.model, model => fieldGetter(model, derivation.fields));
    } else {
        throw Error(`Attempted to derive a model which isn't in the store: ${derivation.type} ${derivation.id}`);
    }
};

export const deriveSubManager = <T extends ModelType>(initialDerivation: Derivation<T>, subscriber: (value: any) => void) => {
    let unsub: () => void;
    let lastDerivation: Derivation<T> = undefined;
    const sub = (derivation: Derivation<T>) => {
        if (derivationsEqual(derivation, lastDerivation)) {
            return;
        } else {
            if (unsub) {
                unsub();
            }
            lastDerivation = derivation;
            unsub = derive(derivation).subscribe(subscriber);
        }
    };
    sub(initialDerivation);
    return sub;
};

export const deriver = <T extends ModelType>(type: T, id: ObjectID, editor?: boolean) => {
    return (field: keyof Model<T>, ...moreFields: string[]) => {
        return { type, id, fields: [field, ...moreFields], editor };
    };
};

const derivationsEqual = <T extends ModelType>(a: Derivation<T>, b: Derivation<T>): boolean => {
    return (a === undefined && b === undefined)
            || (a && b && a.id === b.id
                && a.type === b.type
                && a.editor === b.editor
                && a.fields.every(f => b.fields.includes(f)) 
                && b.fields.every(f => a.fields.includes(f)));
}

export const fieldUpdater = <T extends ModelType>(type: T, id: ObjectID, fields: [keyof Model<T>, ...string[]], editor?: boolean) => {
    return (value: any) => {
        update(type, id, (model) => {
            return fieldCloneWith(model, fields, value);
        }, editor);
    }
};

export const fieldSaver = <T extends ModelType>(type: T, id: ObjectID, fieldSets: ([keyof Model<T>, ...string[]])[]) => {
    return () => {
        const stored = idStore[type][id];
        if (stored) {
            const model = get(stored.model);
            const modelToSave: Partial<Model<T>> & { id: ObjectID } = { id } as any;
            fieldSets.forEach(fields => {
                fieldSetter(modelToSave, fields, fieldGetter(model, fields));
            });
            return save(type, modelToSave);
        } else {
            throw Error(`Attempted to save a model which isn't in the store: ${type} ${id}`);
        }
    };
};

export const fieldManualSync = <T extends ModelType>(type: T, id: ObjectID, fields: [keyof Model<T>, ...string[]], editor?: boolean) => {
    const updater = fieldUpdater(type, id, fields, editor);
    const saver = fieldSaver(type, id, [fields]);

    return (value: any) => {
        updater(value);
        if (!editor) {
            saver();
        }
    };
};

export const fieldSync = <T extends ModelType>(type: T, id: ObjectID, fields: [keyof Model<T>, ...string[]], editor?: boolean) => {
    const sync = fieldManualSync(type, id, fields, editor);
    return (e: CustomEvent<{ value: any }>) => {
        sync(e.detail.value);
    };
};

export const getModel = <T extends ModelType>(type: T, id: ObjectID, editor?: boolean): Model<T> => {
    const stored = idStore[type][id];
    if (stored) {
        return get(editor ? stored.editorModel : stored.model);
    } else {
        throw Error(`Attempted to get a model which isn't in the store: ${type} ${id}`);
    }
};

export const hasModel = <T extends ModelType>(type: T, id: ObjectID): boolean => {
    const stored = idStore[type][id];
    if (stored) {
        return true;
    } else {
        return false;
    }
};

export const saveModel = async <T extends ModelType>(type: T, id: ObjectID): Promise<boolean> => {
    const stored = idStore[type][id];
    if (stored) {
        const model = get(stored.model);
        if (model) {
            await save(type, model);
            return true;
        }
    }
    return false;
};

export const updateAndSaveIfChanged = async <T extends ModelType>(type: T, id: ObjectID, updater: (model: Model<T>) => [boolean, Model<T>]) => {
    let changed;
    update(type, id, (model: Model<T>) => {
        const [modelChanged, newModel] = updater(model);
        changed = modelChanged;
        return newModel;
    });
    if (changed) {
        await saveModel(type, id);
    }
};

export const startEditing = <T extends ModelType>(type: T, id: ObjectID) => {
    const stored = idStore[type][id];
    if (stored) {
        const editorModel = deepCopy(get(stored.model));
        if (stored.editorModel) {
            stored.editorModel.set(editorModel);
        } else {
            stored.editorModel = writable(editorModel);
        }
    } else {
        throw Error(`Attempted to start editing model which isn't in the store: ${type} ${id}`);
    }
};

export const finishEditing = <T extends ModelType>(type: T, id: ObjectID) => {
    const stored = idStore[type][id];
    if (stored && stored.editorModel) {
        const model = get(stored.editorModel);
        stored.model.set(model);
        return save(type, model);
    } else {
        throw Error(`Attempted to finish editing model which isn't in the store: ${type} ${id}`);
    }
};
