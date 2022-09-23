<script lang="ts">
import { createEventDispatcher } from "svelte";

export let options: {name: string, value: any}[];
export let editable: boolean = false;
export let value: any;

const dispatch = createEventDispatcher();

const onInput = () => {
    dispatch('input', { value })
};

const onChange = (e) => {
    dispatch('change', { value: e.target.value });
};

</script>

<select bind:value disabled={!editable} on:change={onChange} on:input={onInput}>
    {#each options as option}
        <option value={option.value}>
            {option.name}
        </option>
    {/each}
</select>

<style>

select {
    width: 100%;
    border-color: #d1d1d1;
    border-style: solid;
    border-width: 1px;
    background: none;
    color: #efefef;
}

option {
    background-color: #09090f;
}
</style>
