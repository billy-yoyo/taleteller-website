<script lang="ts">
import type { IEditor } from "../../models/editor";
import { closeEditor, editorStore } from "../../store/editors";
import { apiToTitle } from "../../util/textHelpers";
import Window from "../common/Window.svelte";
import EditorWrapper from "./EditorWrapper.svelte";

let editors: IEditor[];
editorStore.subscribe((model) => {
    editors = model;
});

</script>

<div class="editors">
    {#each editors as editor (editor.id)}
        <Window title={`${apiToTitle(editor.type)} Editor`} closeable on:close={() => closeEditor(editor.id)}>
            <EditorWrapper editor={editor}/>
        </Window>
    {/each}
</div>

<style>
    .editors {
        width: 0px;
        height: 0px;
    }
</style>