<script lang="ts">
import { createEventDispatcher } from "svelte";

import { createAndStoreDefaultModel } from "../../controller/model";

import type { IItem } from "../../models/item";
import type { ObjectID } from "../../models/objectId";

import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Checkbox from "../common/Checkbox.svelte";
import Field from "../common/Field.svelte";
import Editor from "./Editor.svelte";

export let itemId: ObjectID;
let item: IItem;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('item', itemId, (model) => {
    item = model;
    countChange();
}, true);
$: sub(itemId);

$: deriver = idStore.deriver('item', itemId, true);
$: fieldSync = (field: keyof IItem, ...fields: string[]) => idStore.fieldSync('item', itemId, [field, ...fields], true);

$: subactionFieldSync = idStore.fieldUpdater('item', itemId, ['actions'], true);
const deleteAction = (e: CustomEvent<{ id: ObjectID }>) => {
    subactionFieldSync(item.actions.filter(eid => eid !== e.detail.id));
};

const addAction = async () => {
    const action = await createAndStoreDefaultModel('action', item.scope);
    subactionFieldSync([...item.actions, action.id]);
};

</script>

<div class="item-editor">
    <Field title="Name" type="string" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70}/>
    <div class="checkbox">
        <Checkbox checked={item.equipped} on:change={fieldSync('equipped')}/>
        <div>Equipped</div>
    </div>
    <div class="row">
        <Field title="Quantity" type="number" derivation={deriver('quantity')} grow editable on:change={fieldSync('quantity')}/>
        <Field title="Weight" type="number" derivation={deriver('weight')} grow editable on:change={fieldSync('weight')}/>
        <Field title="equipLoad" type="number" derivation={deriver('equipLoad')} grow editable on:change={fieldSync('equipLoad')}/>
    </div>
    {#each item.actions as actionId}
        <Editor type="action" modelId={actionId} deletable box on:delete={deleteAction}/>
    {/each}
    <button class="new-button" on:click={addAction}>Add Subaction</button>
</div>

<style>
    .item-editor {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .checkbox {
        display: flex;
        flex-direction: row;
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

