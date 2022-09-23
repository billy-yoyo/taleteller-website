<script lang="ts">
import { createEventDispatcher } from "svelte";
import type { ObjectID } from "../../models/objectId";

import type { IUpgradeSet } from "../../models/upgradeSet";

import * as idStore from "../../store/idStore";

export let upgradeSetId: ObjectID;
export let selected = false;

let upgradeSet: IUpgradeSet;

const sub = idStore.subscribeManger('upgradeSet', upgradeSetId, (model) => {
    upgradeSet = model;
});
$: sub(upgradeSetId);

const dispatch = createEventDispatcher();

const onClick = () => {
    dispatch('click', { id: upgradeSetId });
}

</script>

<div class="upgrade-set" class:selected={selected} on:click={onClick}>
    <div class="title">
        {upgradeSet.name}
    </div>
    <div class="description">
        {upgradeSet.description}
    </div>
</div>

<style>
    .upgrade-set {
        display: flex;
        flex-direction: column;
        padding: 5px 10px;
        border: 1px solid #8f8f8f;
        align-items: center;
        flex: 1;
        margin: 5px;
        min-height: 100px;
        border-radius: 15px;
        cursor: pointer;
        background-color: #12121f;
        white-space: pre-wrap;
        text-align: center;
    }

    .upgrade-set:hover {
        background-color: #151523;
    }

    .selected, .selected:hover { 
        background-color: #0c0c17;
    }

    .title {
        font-weight: bold;
    }

    .description {
        font-size: 0.75rem;
    }
</style>