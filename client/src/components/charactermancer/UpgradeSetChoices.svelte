<script lang="ts">
import { createEventDispatcher } from "svelte";

import { get, writable } from "svelte/store";

import type { ObjectID } from "../../models/objectId";
import type { IScope } from "../../models/scope";
import type { IUpgradeSet } from "../../models/upgradeSet";
import * as idStore from "../../store/idStore";
import UpgradeSet from "../models/UpgradeSet.svelte";
import UpgradeChoices from "./UpgradeChoices.svelte";

export let upgradeSetId: ObjectID;
export let characterId: ObjectID;
export let scopes: IScope[];

let upgradeSet: IUpgradeSet;
const sub = idStore.subscribeManger('upgradeSet', upgradeSetId, (model) => {
    upgradeSet = model;
});
$: sub(upgradeSetId);

const dispatch = createEventDispatcher();

const choices = writable<{ [id: ObjectID]: { done: boolean, choices: any } }>(
    Object.fromEntries(upgradeSet.upgrades.map(upgradeId => [upgradeId, { done: false, choices: {} }]))
);

const onSelectChoice = (e: CustomEvent<{ id: ObjectID, choices: any }>) => {
    choices.update(ch => ({ ...ch, [e.detail.id]: { done: ch[e.detail.id].done, choices: e.detail.choices } }));
    dispatch('choices', { choices: Object.fromEntries(Object.entries(get(choices)).map(([k, v]) => [k, v.choices])) });
};

const onDone = (e: CustomEvent<{ id: ObjectID, done: boolean }>) => {
    choices.update(ch => ({ ...ch, [e.detail.id]: { done: e.detail.done, choices: ch[e.detail.id].choices } }));
    dispatch('finished', { finished: Object.values(get(choices)).every(c => c.done) });
};

</script>

<div class="container">
    <div class="upgrade-set">
        <UpgradeSet upgradeSetId={upgradeSetId}/>
    </div>
    <div class="choices">
        {#each upgradeSet.upgrades as upgradeId}
            <UpgradeChoices characterId={characterId} upgradeId={upgradeId} scopes={scopes} on:select={onSelectChoice} on:done={onDone}/>
        {/each}
    </div>
</div>
