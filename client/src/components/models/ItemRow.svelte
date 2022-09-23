<script lang="ts">
import type { IItem } from "../../models/item";
import Checkbox from "../common/Checkbox.svelte";
import Field from "../common/Field.svelte";
import * as idStore from "../../store/idStore";
import type { ObjectID } from "../../models/objectId";
import { spawnEditorIfNotExists } from "../../store/editors";
import { createEventDispatcher } from "svelte";
import EditButton from "./EditButton.svelte";

export let itemId: ObjectID;
export let nameFilter: string = "";
export let deletable: boolean = false;

let item: IItem;

const sub = idStore.subscribeManger('item', itemId, (model) => {
    item = model;
});
$: sub(itemId);

$: deriver = idStore.deriver('item', itemId);
$: fieldSync = (field: keyof IItem) => idStore.fieldSync('item', itemId, [field]);

const dispatch = createEventDispatcher();

const spawnEditor = () => {
    spawnEditorIfNotExists({
        type: "item",
        modelId: itemId,
        onDelete: deletable ? (modelId) => {
            dispatch('delete', { modelId, name: item.name });
        } : undefined
    });
};

</script>

{#if item.name.toLowerCase().includes(nameFilter.toLowerCase())}
    <div class="item">
        <div class="checkbox">
            <Checkbox checked={item.equipped} on:change={fieldSync('equipped')}/>
        </div>
        <Field title={"Name"} derivation={deriver('name')} editable grow on:change={fieldSync('name')} />
        <Field title="quantity" derivation={deriver('quantity')} type="number" editable centered on:change={fieldSync('quantity')}/>
        <Field title="weight" derivation={deriver('weight')} type="number" editable centered on:change={fieldSync('weight')}/>
        <Field title="load" derivation={deriver('equipLoad')} type="number" editable centered on:change={fieldSync('equipLoad')}/>
        <EditButton on:edit={spawnEditor}>
            Edit
        </EditButton>
    </div>
{/if}

<style>
    .item {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 10px;
    }

    .checkbox {
        align-self: flex-end;
        margin-bottom: 5px;
        margin-right: 10px;
    }
</style>