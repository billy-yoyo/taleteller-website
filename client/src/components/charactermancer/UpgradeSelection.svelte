<script lang="ts">
import { createEventDispatcher } from "svelte";

import type { IClass } from "../../models/class";
import type { ObjectID } from "../../models/objectId";
import * as idStore from "../../store/idStore";
import UpgradeSetCard from "../models/UpgradeSetCard.svelte";

export let classId: ObjectID;
export let classLevel: number;

let _class: IClass;
const sub = idStore.subscribeManger('class', classId, (model) => {
    _class = model;
});
$: sub(classId);

const dispatch = createEventDispatcher();

const onClick = (e: CustomEvent<{ id: ObjectID }>) => {
    dispatch('select', { id: e.detail.id })
};

</script>

<div class="upgradeSets">
    {#each _class.levels[classLevel] as upgradeSetId}
        <UpgradeSetCard upgradeSetId={upgradeSetId} on:click={onClick}/>
    {/each}
</div>
