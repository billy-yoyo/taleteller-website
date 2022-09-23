<script lang="ts">
import type { EditorMode, IEditor } from "../../models/editor";
import type { ObjectID } from "../../models/objectId";
import { closeEditor } from "../../store/editors";
import Field from "../common/Field.svelte";
import Editor from "./Editor.svelte";

export let editor: IEditor;
let mode: EditorMode = editor.mode;
let modelId: ObjectID = editor.modelId;

const onDelete = () => {
    if (editor.onDelete) {
        editor.onDelete(modelId);
    }
    closeEditor(editor.id);
}

const onChangeModel = async (e: CustomEvent<{ value: any }>) => {
    let newModelId = e.detail.value;
    if (newModelId) {
        if (editor.onSelect) {
            newModelId = await editor.onSelect(newModelId);
        }

        editor.modelId = newModelId;
        modelId = newModelId;
        mode = 'editing';
    }
};

</script>

{#if mode === 'editing'}
    <Editor type={editor.type} modelId={modelId} deletable={editor.onDelete !== undefined} on:delete={onDelete} />
{:else}
    <Field title="Choose" type="model" modelType={editor.type} scope={editor.scope} searchScopes={editor.searchScopes || []} grow editable on:change={onChangeModel} topmargin/>
{/if}
