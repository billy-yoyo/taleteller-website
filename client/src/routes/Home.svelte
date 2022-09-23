<script lang="ts">
import { useNavigate } from "svelte-navigator";
import CardList from "../components/cards/CardList.svelte";
import { createAndStoreCampaign } from "../controller/campaign";
import { createAndStoreCharacter } from "../controller/character";
import { createAndStoreDefaultModel } from "../controller/model";
import { createDefaultCampaign } from "../models/campaign";
import { createDefaultCharacter } from "../models/character";
import { scopeArray } from "../models/pagination";
import type { IUser } from "../models/user";
import { search } from "../repo/model";
import * as me from "../store/me";

const navigate = useNavigate();

let user: IUser;
me.user.subscribe(model => {
	user = model;

	if (!model) {
		navigate("/login");
	}
});

$: characterSearch = search('character', { page: 0, limit: 5, scopes: scopeArray({ type: "user", link: user.id }) });
$: campaignSearch = search('campaign', { page: 0, limit: 5, scopes: scopeArray({ type: "user", link: user.id }) });

const onCreateCharacter = async () => {
	const character = await createAndStoreDefaultModel('character');
	navigate(`/charactermancer/${character.id}/`);
};

const onCreateCampaign = async () => {
	const campaign = await createAndStoreDefaultModel('campaign');
	navigate(`/campaign/${campaign.id}`);
};
</script>

<article>
	<div class="row">
		<div class="item">
			<CardList title="Characters" cards={characterSearch} createButton="Create Character" on:create={onCreateCharacter}></CardList>
		</div>
		<div class="item">
			<CardList title="Campaigns" cards={campaignSearch} createButton="Create Campaign" on:create={onCreateCampaign}></CardList>
		</div>
	</div>
</article>

<style>
	article {
		padding-top: 10px;
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		flex-direction: row;
	}

	.item {
		flex: 1;
		padding: 15px;
		margin: 5px;
		border: 1px solid #6f6f75;
		border-radius: 5px;
		box-sizing: border-box;
		width: 0;
	}
</style>
