import { get, writable, Writable } from "svelte/store";
import type { IEditor } from "../models/editor";
import type { ModelType } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";

export const editorStore: Writable<IEditor[]> = writable([]);

interface EditorOptions {
    type: ModelType;
    modelId: ObjectID;
    onDelete?: (modelId: string) => void;
}

interface CreaterOptions {
    type: ModelType;
    scope: IScope;
    searchScopes: IScope[];
    onSelect?: (modelId: ObjectID) => Promise<ObjectID>;
    onDelete?: (modelId: string) => void;
}

export const openEditor = (editor: IEditor) => {
    editorStore.update(current => {
        if (current.find(e => e.id === editor.id)) {
            return current;
        } else {
            return [...current, editor];
        }
    });
};

export const closeEditor = (editorId: number) => {
    editorStore.update(current => {
        return current.filter(e => e.id !== editorId);
    });
};

let idCounter = { id: 1 };

const createEditor = (opts: EditorOptions): IEditor => {
    return {
        id: idCounter.id++,
        mode: 'editing',
        ...opts
    };
};

const createCreater = (opts: CreaterOptions): IEditor => {
    return {
        id: idCounter.id++,
        mode: 'creating',
        ...opts
    }
};

export const spawnEditor = (opts: EditorOptions) => {
    openEditor(createEditor(opts));
};

export const spawnCreater = (opts: CreaterOptions) => {
    openEditor(createCreater(opts));
}

export const spawnEditorIfNotExists = (opts: EditorOptions) => {
    const existingEditor = get(editorStore).find(e => e.type === opts.type && e.modelId === opts.modelId);
    if (existingEditor) {
        existingEditor.onDelete = opts.onDelete;
    } else {
        spawnEditor(opts);
    }
}
