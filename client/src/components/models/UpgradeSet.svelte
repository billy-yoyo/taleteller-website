<script lang="ts">
import { useNavigate } from "svelte-navigator";

import type { ObjectID } from "../../models/objectId";
import type { IUpgradeSet } from "../../models/upgradeSet";
import { checkWriteAccess } from "../../repo/util";
import * as idStore from "../../store/idStore";
import TagList from "../common/TagList.svelte";
import Editor from "../editors/Editor.svelte";
import EditButton from "./EditButton.svelte";
import Upgrade from "./Upgrade.svelte";

export let upgradeSetId: ObjectID;
export let editEnabled: boolean = false;
export let editing: boolean = false;

let upgradeSet: IUpgradeSet;
let editable: boolean = false;

const sub = idStore.subscribeManger('upgradeSet', upgradeSetId, (model) => { upgradeSet = model; });
$: sub(upgradeSetId);

checkWriteAccess(upgradeSet.scope).then(hasAccess => { editable = hasAccess });

const navigate = useNavigate();

const startEditing = () => {
    navigate(`/upgradeSet/${upgradeSetId}/edit`);
};

const stopEditing = () => {
    navigate(`/upgradeSet/${upgradeSetId}`);
};

</script>

{#if editing && editable}
    <Editor type="upgradeSet" modelId={upgradeSetId} stoppable on:stop={stopEditing}/>
{:else}
    <div class="upgrade-set">
        <div class="title">
            <div class="title-text">
                {upgradeSet.name}
            </div>
            {#if editable && editEnabled}
                <EditButton on:edit={startEditing}>Edit</EditButton>
            {/if}
        </div>
        <div class="api-title">
            {`API Name: ${upgradeSet.apiName}`}
            {`Cost: ${upgradeSet.cost}`}
        </div>

        <TagList tags={upgradeSet.tags} boxed titlecase/>

        <div class="description">
            {upgradeSet.description}
        </div>

        <div class="upgrades">
            <div class="upgrade-title">
                Upgrades:
            </div>
            <ul class="upgrade-list">
                {#each upgradeSet.upgrades as upgradeId}
                    <li><Upgrade upgradeId={upgradeId}/></li>
                {/each}
            </ul>
        </div>
    </div>
{/if}

<style>
    .upgrade-set {
        margin: 10px;
        display: flex;
        flex-direction: column;
    }

    .title {
        font-weight: bold;
        font-size: 1.5rem;
        width: 100%;
        padding-left: 5px;
        padding-bottom: 5px;
        border-bottom: 2px solid #4f4f4f;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .title-text {
        flex: 1;
    }

    .api-title {
        font-size: 0.75rem;
        color: #afafaf;
    }

    .description {
        margin-top: 5px;
        padding: 5px;

        white-space: pre-wrap;
    }

    .upgrades {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
    }

    .upgrade-title {
        font-weight: bold;
    }

    .upgrade-list {
        display: flex;
        flex-direction: column;
        margin-left: -5px;
        margin-top: 3px;
        margin-bottom: 3px;
    }
</style>