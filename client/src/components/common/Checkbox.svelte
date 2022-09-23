<script lang="ts">
import { createEventDispatcher } from "svelte";

export let checked: boolean = false;

const dispatch = createEventDispatcher();

const onChange = (event) => {
    dispatch('change', { value: event.target.checked });
};
</script>

<input type="checkbox" checked={checked} on:change={onChange}>

<style>
input {
    margin: 0;
}
</style>
