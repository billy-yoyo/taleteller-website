<script lang="ts" context="module">
	export const SCREENS = {};
	export interface ScreenAPI {
		registerScreen: () => number
		selectScreen: (screen: number) => void
		selectedScreen: Writable<number>
		totalScreens: Writable<number>
	};

</script>

<script lang="ts">
	import { setContext } from 'svelte';
	import { get, Writable, writable } from 'svelte/store';

	const selectedScreen = writable<number>();
    const totalScreens = writable(0);

	setContext<ScreenAPI>(SCREENS, {
		registerScreen: () => {
			selectedScreen.update(current => current === undefined ? 0 : current);
            totalScreens.update(total => total + 1);
            return get(totalScreens) - 1;
		},

		selectScreen: (screen: number) => {
			const total = get(totalScreens);
            selectedScreen.set(Math.min(Math.max(screen, 0), total - 1));
		},

		selectedScreen,
        totalScreens
	});
</script>

<div class="screens">
	<slot></slot>
</div>

<style>
	.screens {
		display: flex;
		width: 100%;
		margin: 15px;
	}
</style>