import type { ModelType } from "./model";
import type { ObjectID } from "./objectId";
import type { IScope } from "./scope";

export type EditorMode = 'creating' | 'editing';

export interface IEditor {
    id: number;
    mode: EditorMode;
    type: ModelType;
    modelId?: ObjectID;
    scope?: IScope;
    searchScopes?: IScope[];
    onDelete?: (modelId: ObjectID) => void;
    onSelect?: (modelId: ObjectID) => Promise<ObjectID>;
}
