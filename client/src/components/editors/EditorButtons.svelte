<script lang="ts">
import { createEventDispatcher } from "svelte";

export let valid: boolean;
export let name: string;
export let changes: boolean;
export let deletable: boolean;
export let stoppable: boolean;

const dispatch = createEventDispatcher();

const onSave = () => {
    if (valid) {
        dispatch('save');
    }
};

const onReset = () => {
    dispatch('reset');
};

const onDelete = () => {
    dispatch('delete');
};

const onStop = () => {
    dispatch('stop');
};
</script>

<div class="buttons">
    {#if deletable}
        <button on:click={onDelete}>Delete {name}</button>
    {/if}
    <button on:click={onReset}>Reset {name}</button>
    <button on:click={onSave} class:changes={changes} class:error={!valid} disabled={!valid}> Save {name}</button>
    {#if stoppable}
        <button on:click={onStop}>Stop Editing {name}</button>
    {/if}
</div>

<style>
    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 10px;
    }

    button {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
    }

    .changes {
        background-color: #091606;
    }

    .error {
        background-color: #160909;
        color: #afafaf;
        border-color: #afafaf;
    }
</style> 