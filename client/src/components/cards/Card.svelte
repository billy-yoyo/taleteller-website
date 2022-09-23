<script lang="ts">
import type { ICard } from "../../models/card";
import { link } from "svelte-navigator";
import { createEventDispatcher } from "svelte";
import TagList from "../common/TagList.svelte";

export let card: ICard;
export let deletable: boolean = false;
export let customclick: boolean = false;
export let selected: boolean = false;

const dispatch = createEventDispatcher();

const onDelete = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch('delete', { id: card.id, name: card.name });
};

const getName = (card: ICard) => {
    if (card.cost) {
        if (card.cost === 1) {
            return `${card.name} (${card.cost} point)`
        } else {
            return `${card.name} (${card.cost} points)`
        }
    } else {
        return card.name;
    }
}

$: onClick = customclick ? () => {
    dispatch('click', { id: card.id, cost: card.cost });
} : undefined;

</script>

<a class="card" href={customclick ? undefined : `/${card.type}/${card.id}`} on:click={onClick} title={card.name} class:selected={selected} use:link>
    <div class="title">
        <div>{getName(card)}</div>
        {#if deletable}
            <button on:click={onDelete}>Delete</button>
        {/if}
    </div>
    {#if card.description !== undefined}
        <div class="description">
            {card.description}
        </div>
    {/if}
    {#if card.tags !== undefined && card.tags.length > 0}
        <TagList tags={card.tags} titlecase/>
    {/if}
</a>

<style>
	.card {
        background-color: #141418;
        font-size: 1rem;
        border-style: solid;
        border-width: 1px;
        border-color: #34343a;
        border-radius: 5px;
        cursor: pointer;
        padding: 7px 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 20px;
        color: #efefef;
        text-decoration: none;
        margin-bottom: 5px;
        max-width: 100%;
        font-weight: bold;
        overflow: hidden;
        align-items: flex-start;
    }

    .selected {
        background-color: #17171b;
        border-color: #323238;
    }

    .description {
        font-size: 0.75rem;
        color: #afafaf;
    }

    .title {
        display: flex;
        flex-direction: row;
    }

    button {
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

    button:hover {
        background-color: #121219;
    }
</style>