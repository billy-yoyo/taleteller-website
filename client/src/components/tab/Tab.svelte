<script>
	import { getContext } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const tab = {};
	const { registerTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);
</script>

<button class:selected="{$selectedTab === tab}" on:click="{() => selectTab(tab)}">
	<slot></slot>
</button>

<style>
	button {
		background: none;
		border: none;
		border-radius: 0;
		margin: 0;
		padding-right: 20px;
		padding-left: 20px;
		background-color: #12121f;
		border-width: 1px;
		border-bottom-style: solid;
		border-bottom-color: #efefef;
		border-right-style: solid;
		border-right-color: #050513;
		color: #ddd;
	}
	
	.selected {
		border-bottom-style: none;
		border-right-style: solid;
		border-top-style: solid;
		border-left-style: solid;
		border-color: #efefef;
		background-color: #1a1a23;
		color: #fff;
	}
</style>

