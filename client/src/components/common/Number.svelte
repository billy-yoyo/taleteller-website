<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let value: number;
    export let editable: boolean = false;
    export let centered: boolean = false;
    export let error: boolean = false;
    export let min: number = undefined;
    export let max: number = undefined;

    $: tempValue = value;

    const dispatch = createEventDispatcher();

    const onChange = (event) => {
        if (event.target.value === "") {
            tempValue = value;
        } else {
            if (min !== undefined && tempValue < min) {
                tempValue = min;
            }
            if (max !== undefined && tempValue > max) {
                tempValue = max;
            }
            dispatch('change', { value: tempValue });
        }
    };

    const onInput = (event) => {
        dispatch('input', { value: tempValue });
    };
</script>
    
<input class:error={error} class:centered={centered} type="number" bind:value={tempValue} min={min} max={max} size="1" disabled={!editable} on:change={onChange} on:input={onInput}>

<style>

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

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}
</style> 