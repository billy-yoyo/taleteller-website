<script lang="ts">
import { createEventDispatcher } from "svelte";
import { titleCase } from "../../util/textHelpers";

export let tag: string;
export let titlecase: boolean = false;
export let clickable: boolean = false;
export let boxed: boolean = false;

const dispatch = createEventDispatcher();

const removeTag = () => {
    if (clickable) {
        dispatch('remove');
    }
};
</script>

<div class="tag" on:click={removeTag} title="Remove tag" class:clickable={clickable} class:boxed={boxed}>
    {titlecase ? titleCase(tag) : tag}
</div>

<style>
.tag {
    display: inline-flex;
}

.tag.boxed {
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    border: 1px solid #efefef;
    border-radius: 3px;
    padding: 3px 5px;
    background-color: #15151f;
    color: #efefef;
    margin-left: 5px;
    margin-top: 2px;
    margin-bottom: 2px;
    font-size: 1rem;
}

.tag.clickable {
    cursor: pointer;
}

.tag.clickable:hover {
    background-color: #2f2f35;
}
</style>