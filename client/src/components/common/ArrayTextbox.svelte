<script lang="ts">
import { createEventDispatcher } from "svelte";
import Tag from "./Tag.svelte";
import Textbox from "./Textbox.svelte";


export let tags: string[];
export let editable: boolean = false;
export let centered: boolean = false;
export let maxlength: number = 70;
export let titlecase: boolean = false;
let currentTag: string;

const dispatch = createEventDispatcher();

const removeTag = (tag: string) => {
    const tagIndex = tags.indexOf(tag);
    if (tagIndex >= 0) {
        const newTags = tags.slice();
        newTags.splice(tagIndex, 1);
        dispatch('change', { value: newTags });
    }
};

const addTag = () => {
    console.log(currentTag);
    if (currentTag && !tags.includes(currentTag)) {
        dispatch('change', { value: [...tags, currentTag] });
        currentTag = '';
    }
}

</script>

<div class="tag-container">
    <Textbox bind:value={currentTag} submitButton="Add" editable={editable} centered={centered} maxlength={maxlength} withline on:submit={addTag}/>
    <div class="tags">
        {#each tags as tag}
            <Tag tag={tag} titlecase={titlecase} clickable boxed on:remove={() => removeTag(tag)}/>
        {/each}
    </div>
</div>

<style>
.tag-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.tags {
    margin-top: 3px;
    display: flex;
    flex-direction: row;
}
</style>