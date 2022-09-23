<script lang="ts">
import { createEventDispatcher } from "svelte";
import { createAndStoreDefaultModel } from "../../controller/model";
import type { ObjectID } from "../../models/objectId";
import type { IUpgradeSet } from "../../models/upgradeSet";
import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Field from "../common/Field.svelte";
import Editor from "./Editor.svelte";

export let upgradeSetId: ObjectID;
let upgradeSet: IUpgradeSet;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('upgradeSet', upgradeSetId, (model) => {
    upgradeSet = model;
    countChange();
}, true);
$: sub(upgradeSetId);

$: deriver = idStore.deriver('upgradeSet', upgradeSetId, true);
$: fieldSync = (field: keyof IUpgradeSet, ...fields: string[]) => idStore.fieldSync('upgradeSet', upgradeSetId, [field, ...fields], true);

$: upgradesFieldSync = idStore.fieldUpdater('upgradeSet', upgradeSetId, ['upgrades'], true);
const deleteUpgrade = (e: CustomEvent<{ id: ObjectID }>) => {
    upgradesFieldSync(upgradeSet.upgrades.filter(uid => uid !== e.detail.id));
};

const addUpgrade = async () => {
    const upgrade = await createAndStoreDefaultModel('upgrade', upgradeSet.scope);
    upgradesFieldSync([...upgradeSet.upgrades, upgrade.id]);
};

</script>

<div class="upgrade-set-editor">
    <Field title="Name" type="string" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70} topmargin/>
    <Field title="API Name" type="string" derivation={deriver('apiName')} grow editable on:change={fieldSync('apiName')} max={70} topmargin/>
    <Field title="Cost" type="number" derivation={deriver('cost')} grow editable on:change={fieldSync('cost')} topmargin/>
    <Field title="Tags" type="array" derivation={deriver('tags')} grow editable on:change={fieldSync('tags')} titlecase max={70}/>
    <Field title="Description" type="area" derivation={deriver('description')} rows={5} grow editable on:change={fieldSync('description')} max={1000} nullable topmargin></Field>
    <div class="upgrades">
        {#each upgradeSet.upgrades as upgradeId}
            <Editor type="upgrade" modelId={upgradeId} box on:delete={deleteUpgrade} deletable />
        {/each}
        <button class="new-button" on:click={addUpgrade}>Add Upgrade</button>
    </div>
</div>

<style>
    .upgrade-set-editor {
        display: flex;
        flex-direction: column;
    }

    .upgrades {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        margin-top: 10px;
    }

    .new-button {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
    }
</style>
