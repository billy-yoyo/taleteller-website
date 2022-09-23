<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let value: string = "";
export let editable: boolean = false;
export let centered: boolean = false;
export let error: boolean = false;
export let maxlength: number = undefined;
export let submitButton: string = undefined;
export let withline: boolean = false;
export let password: boolean = false;

const dispatch = createEventDispatcher();

const onChange = (event) => {
    dispatch('change', { value: event.target.value  });
};

const onInput = () => {
    dispatch('input', { value });
};

const onSubmit = () => {
    dispatch('change', { value });
    dispatch('submit', { value });
};

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        onSubmit();
    }
}
</script>

<div class="input-container">
    {#if password}
        <input class:withline={withline} class:error={error} class:centered={centered} type="password" bind:value maxlength={maxlength} size="1" disabled={!editable} on:change={onChange} on:input={onInput} on:keydown={onKeyDown}>
    {:else}
        <input class:withline={withline} class:error={error} class:centered={centered} type="text" bind:value maxlength={maxlength} size="1" disabled={!editable} on:change={onChange} on:input={onInput} on:keydown={onKeyDown}>
    {/if}
    {#if submitButton !== undefined}
        <button class="submit" on:click={onSubmit}>{submitButton}</button>
    {/if}
</div>

<style>

.input-container {
    flex: 1;
    display: flex;
    flex-direction: row;
}

input {
    flex: 1;
    border: none;
    padding: 0;
    margin: 0;
    background: unset;
    color: unset;
    width: unset;
    min-width: unset;
}

.centered {
    text-align: center;
}

.error {
    border-style: solid;
    border-color: #934545;
    border-width: 1px;
}

.submit {
    background-color: #3f3f49;
    border: 1px solid #1f1f29;
    color: #efefef;
    font-size: 0.75rem;
    margin: 0;
    margin-left: 3px;
    
}

.withline {
    border-color: #d1d1d1;
    border-bottom-style: solid;
    border-width: 1px;
}


</style> 