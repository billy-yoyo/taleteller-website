<script lang="ts">
import type { IDialog } from "../../models/dialog";
import { closeDialog, dialogStore } from "../../store/dialogs";
import Field from "./Field.svelte";
import Window from "./Window.svelte";

let dialogs: IDialog[] = [];
let data: any = {};

dialogStore.subscribe((model) => {
    dialogs = model;
});

const triggerOption = (dialog: IDialog, callback: (data?: any) => boolean) => {
    if (callback(data)) {
        closeDialog(dialog.id);
    }
}

const onKeyChange = (key: string) => {
    return (e: CustomEvent<{ value: any }>) => {
        data[key] = e.detail.value;
    }
};
</script>

<div class="dialogs">
    {#each dialogs as dialog (dialog.id)}
        <Window title={dialog.title}>
            <div class="dialog">
                <div class="content">
                    {dialog.content}
                </div>
                <div class="fields">
                    {#each dialog.fields as field}
                        <Field {...field.props} on:change={onKeyChange(field.key)}/>
                    {/each}
                </div>
                <div class="options">
                    {#each dialog.options as option}
                        <div class="option" on:click={() => triggerOption(dialog, option.callback)}>
                            {option.name}
                        </div>
                    {/each}
                </div>
            </div>
        </Window>
    {/each}
</div>

<style>
    .dialogs {
        width: 0px;
        height: 0px;
    }

    .dialog {
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

    .content {
        white-space: pre-line;
    }
    
    .options {
        margin-top: 10px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }

    .option {
        cursor: pointer;
        margin-left: 3px;
        border: 1px solid #cfcfcf;
        border-radius: 5px;
        padding: 1px 5px;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
    }

    .option:hover {
        background-color: #121219;
    }
</style>

