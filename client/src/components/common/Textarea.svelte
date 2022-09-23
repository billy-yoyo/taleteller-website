<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let value: string;
export let editable: boolean = false;
export let centered: boolean = false;
export let error: boolean = false;
export let rows: number = undefined;
export let cols: number = undefined;
export let maxlength: number = undefined;

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
    <textarea class:error={error} class:centered={centered} bind:value maxlength={maxlength} rows={rows} cols={cols} disabled={!editable} on:change={onChange} on:input={onInput} on:keydown={onKeyDown}></textarea>
</div>

<style>

.input-container {
    flex: 1;
    display: flex;
    flex-direction: row;
}

textarea {
    flex: 1;
    border: none;
    padding: 0;
    margin: 0;
    background: unset;
    color: unset;
    width: unset;
    min-width: unset;
    border-color: #d1d1d1;
    border-style: solid;
    border-width: 1px;
}

.centered {
    text-align: center;
}

.error {
    border-style: solid;
    border-color: #934545;
    border-width: 1px;
}


</style> 