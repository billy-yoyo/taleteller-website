<script lang="ts">
import { createEventDispatcher } from "svelte";
import { createAndStoreDefaultModel } from "../../controller/model";
import type { IAction } from "../../models/action";
import type { ObjectID } from "../../models/objectId";
import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Field from "../common/Field.svelte";
import Tab from "../tab/Tab.svelte";
import TabList from "../tab/TabList.svelte";
import Tabs from "../tab/Tabs.svelte";
import TabView from "../tab/TabView.svelte";
import Editor from "./Editor.svelte";
import ResourceCost from "./ResourceCost.svelte";

export let actionId: ObjectID;
let action: IAction;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('action', actionId, (model) => {
    action = model;
    countChange();
}, true);
$: sub(actionId);

$: deriver = idStore.deriver('action', actionId, true);
$: fieldSync = (field: keyof IAction, ...fields: string[]) => idStore.fieldSync('action', actionId, [field, ...fields], true);

$: effectsFieldSync = idStore.fieldUpdater('action', actionId, ['effects'], true);
const deleteEffect = (e: CustomEvent<{ id: ObjectID }>) => {
    effectsFieldSync(action.effects.filter(eid => eid !== e.detail.id));
};

const addEffect = async () => {
    const effect = await createAndStoreDefaultModel('effect', action.scope);
    effectsFieldSync([...action.effects, effect.id]);
};

$: subactionFieldSync = idStore.fieldUpdater('action', actionId, ['subactions'], true);
const deleteSubaction = (e: CustomEvent<{ id: ObjectID }>) => {
    subactionFieldSync(action.subactions.filter(eid => eid !== e.detail.id));
};

const addSubaction = async () => {
    const subaction = await createAndStoreDefaultModel('action', action.scope);
    subactionFieldSync([...action.subactions, subaction.id]);
};

</script>

<div class="action-editor">
    <Field title="Name" type="string" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70}/>
    <Field title="Tags" type="array" derivation={deriver('tags')} grow editable on:change={fieldSync('tags')} titlecase max={70}/>
    <Field title="Description" type="area" derivation={deriver('description')} rows={5} grow editable on:change={fieldSync('description')} max={255} nullable />
    <ResourceCost costs={action.cost} on:change={fieldSync('cost')}/>
    <Tabs>
        <TabList>
            <Tab>Effects</Tab>
            <Tab>Subactions</Tab>
        </TabList>

        <TabView>
            {#each action.effects as effectId}
                <Editor type="effect" modelId={effectId} box on:delete={deleteEffect} deletable />
            {/each}
            <button class="new-button" on:click={addEffect}>Add Effect</button>
        </TabView>

        <TabView>
            {#each action.subactions as actionId}
                <Editor type="action" modelId={actionId} box on:delete={deleteSubaction} deletable />
            {/each}
            <button class="new-button" on:click={addSubaction}>Add Subaction</button>
        </TabView>
    </Tabs>
</div>

<style>
.action-editor {
    padding: 10px;
    min-width: 400px;
}

.action-editor > :global(*) {
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
    margin-top: 10px;
}



</style> 
