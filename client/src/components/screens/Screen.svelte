<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import { ScreenAPI, SCREENS } from './Screens.svelte';

    export let finished: boolean = true;

	const { registerScreen, selectScreen, selectedScreen, totalScreens } = getContext<ScreenAPI>(SCREENS);
	const screenId = registerScreen();

    const dispatch = createEventDispatcher();

    const onClickBack = () => {
        selectScreen(screenId - 1);
    };

    const onClickNext = () => {
        if (finished) {
            selectScreen(screenId + 1);
        }
    };

    const onClickDone = () => {
        dispatch('done');
    };
</script>

{#if $selectedScreen === screenId}
	<div class="screen">
        <div class="body">
            <slot></slot>
        </div>
        <div class="controls">
            {#if screenId > 0}
                <button on:click={onClickBack}>Back</button>
            {/if}
            <div class="space"></div>
            {#if screenId < $totalScreens - 1}
                <button on:click={onClickNext} disabled={!finished}>Next</button>
            {:else}
                <button on:click={onClickDone}>Done</button>
            {/if}
        </div>
	</div>
{/if}

<style>
	.screen {
		display: flex;
        flex-direction: column;
        flex: 1;
	}

    .body {
        flex: 1;
    }

    .controls {
        display: flex;
        flex-direction: row;
    }

    .space {
        flex: 1;
    }

    button {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        font-size: 1rem;
        background-color: #090916;
        color: #cfcfcf;
        margin-top: 20px;
        margin-right: 10px;
        margin-left: 10px;
    }

    button[disabled] {
        background-color: #01010c;
        color: #a9a9a9;
        cursor: unset;
    }
</style>
