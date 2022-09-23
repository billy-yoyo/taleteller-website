<script lang="ts">
import { createEventDispatcher } from "svelte";
import type { ICard } from "../../models/card";
import CardComponent from "./Card.svelte";

export let title: string;
export let cards: Promise<ICard[]>;
export let createButton: string = undefined;

const dispatch = createEventDispatcher();

const onCreate = () => {
    dispatch('create');
};
</script>

<div class="container">
    <div class="title">
        {title}
    </div>
    {#await cards}
        <p>Loading...</p>
    {:then cards}
        <div class="list">
            {#each cards as card (card.id)}
                <CardComponent card={card}></CardComponent>
            {/each}
            {#if createButton !== undefined}
                <button on:click={onCreate}>{createButton}</button>
            {/if}
        </div>
    {:catch error}
        <p style="color: red">Failed to load characters</p>
    {/await}
    
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

	.title {
        font-weight: bold;
        font-size: 1.5rem;
        margin-bottom: 5px;
        margin-left: 3px;
    }

    .list {
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
    }

    button {
        justify-self: right;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
        margin-top: 10px;
    }
</style>