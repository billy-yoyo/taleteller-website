<script lang="ts">
import type { IItem } from "../../models/item";
import * as idStore from "../../store/idStore";
import type { ObjectID } from "../../models/objectId";
import Field from "../common/Field.svelte";
import { checkWriteAccess } from "../../repo/util";
import Editor from "../editors/Editor.svelte";
import EditButton from "./EditButton.svelte";
import Action from "./Action.svelte";
import { useNavigate } from "svelte-navigator";

export let itemId: ObjectID;
export let editing: boolean = false;

let item: IItem;
let editable: boolean = false;

const sub = idStore.subscribeManger('item', itemId, (model) => {
    item = model;
});
$: sub(itemId);

// Deliberately only check this once, require a hard reload. We don't expect scope or user permissions to change frequently.
checkWriteAccess(item.scope).then(hasAccess => { editable = hasAccess });

$: deriver = idStore.deriver('item', itemId);

const navigate = useNavigate();

const startEditing = () => {
    navigate(`/item/${itemId}/edit`);
};

const stopEditing = () => {
    navigate(`/item/${itemId}`);
};

</script>

{#if editing && editable}
    <Editor type="item" modelId={itemId} stoppable on:stop={stopEditing}/>
{:else}
    <div class="item">
        <div class="title">
            <div class="title-text">
                {item.name}
            </div>
            {#if editable}
                <EditButton on:edit={startEditing}>
                    Edit
                </EditButton>
            {/if}
        </div>
        <div class="equipped">
            {`Equipped: ${item.equipped}`}
        </div>
        <div class="row">
            <Field title="Quantity" type="number" derivation={deriver('quantity')} grow max={70}/>
            <Field title="Weight" type="number" derivation={deriver('weight')} grow max={70}/>
            <Field title="Equip Load" type="number" derivation={deriver('equipLoad')} grow max={70}/>
        </div>
        {#each item.actions as actionId}
            <div class="box">
                <Action actionId={actionId} editEnabled={false}/>
            </div>
        {/each}
    </div>
{/if}

<style>
    .row {
        display: flex;
        flex-direction: row;
    }

    .item {
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
    }

    .title-text {
        flex: 1;
    }

    .equipped {
        margin-top: 5px;
        padding: 5px;
    }
</style>
