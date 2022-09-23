<div class="tab-list">
	<slot></slot>
	<div class="rest">

	</div>
</div>

<style>
	.tab-list {
		display: flex;
		flex-direction: row;
		width: 100%;
	}

	.tab-list > :global(:nth-last-child(2)) {
		border-right-style: none;
	}

	.rest {
		flex: 1;
		border-bottom-style: solid;
		border-width: 1px;
		border-color: #efefef;
		width: 100%;
	}
</style>