<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const panel = {};
	const { registerPanel, selectedPanel } = getContext(TABS);

	registerPanel(panel);
</script>

{#if $selectedPanel === panel}
	<div class="view">
		<slot></slot>
	</div>
{/if}

<style>
	.view {
		border-left-style: solid;
		border-bottom-style: solid;
		border-right-style: solid;
		border-top-style: none;
		border-width: 1px;
		border-color: #efefef;
		width: 100%;
		flex: 1;
		padding: 10px;
		box-sizing: border-box;

		height: 100%;
		overflow-y: auto;
		min-height: 0;
	}
</style>