<script lang="ts">
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

const edit = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch('edit');
};
</script>

<button class="edit-button" on:click={edit}>
    <slot></slot>
</button>

<style>
.edit-button {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    border: 1px solid #bfbfbf;
    border-radius: 5px;
    padding: 3px 7px;
    margin: 0;
    font-size: 0.75rem;
    background-color: #090916;
    color: #cfcfcf;
    margin-right: 5px;
}

.edit-button:hover {
    background-color: #121219;
}
</style>