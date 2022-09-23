<script lang="ts">
import Tag from "./Tag.svelte";

export let tags: string[];
export let boxed: boolean = false;
export let titlecase: boolean = false;

</script>

<div class="tags">
    {#if tags.length > 0}
        <Tag tag={tags[0]} titlecase={titlecase}/>
        {#each tags.slice(1) as tag}
            {#if !boxed}
                <span class="divider"></span>
            {/if}
            <Tag tag={tag} titlecase={titlecase}/>
        {/each}
    {/if}
</div>

<style>
    .tags {
        font-size: 0.75rem;
        color: #cfcfcf;
        padding-top: 3px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .divider {
        height: 0.75rem;
        border-right: 1px solid #cfcfcf;
        margin-left: 5px;
        margin-right: 5px;
    }
</style>