<script lang="ts">
import type { IAction } from "../../models/action";
import type { ObjectID } from "../../models/objectId";
import Field from "../common/Field.svelte";
import * as idStore from "../../store/idStore";
import SubactionCard from "./SubactionCard.svelte";
import Editor from "../editors/Editor.svelte";
import { checkWriteAccess } from "../../repo/util";
import EditButton from "./EditButton.svelte";
import TagList from "../common/TagList.svelte";
import { useNavigate } from "svelte-navigator";

export let actionId: ObjectID;
export let editEnabled: boolean = false;
export let editing: boolean = false;

let action: IAction;
let editable: boolean = false;

const sub = idStore.subscribeManger('action', actionId, (model) => {
    action = model;
});
$: sub(actionId);

// Deliberately only check this once, require a hard reload. We don't expect scope or user permissions to change frequently.
checkWriteAccess(action.scope).then(hasAccess => { editable = hasAccess });

$: deriver = idStore.deriver('action', actionId);

const navigate = useNavigate();

const startEditing = () => {
    navigate(`/action/${actionId}/edit`);
};

const stopEditing = () => {
    navigate(`/action/${actionId}`);
};

</script>

{#if editing && editable}
    <Editor type="action" modelId={actionId} stoppable on:stop={stopEditing}/>
{:else}
    <div class="action">
        <div class="title">
            <div class="title-text">
                {action.name}
            </div>
            {#if editable && editEnabled}
                <EditButton on:edit={startEditing}/>
            {/if}
        </div>
        <TagList tags={action.tags} boxed titlecase/>
        <Field title="Description" type="area" derivation={deriver('description')} rows={5} grow max={255} nullable />
        <TagList tags={action.cost.map(c => `${c.amount}${c.resourceShortName}`)} boxed/>
        <div class="subactions">
            <div class="subaction-title">
                Subactions
            </div>
            {#each action.subactions as actionId}
                <SubactionCard actionId={actionId} />
            {/each}
        </div>
    </div>
{/if}

<style>
.action {
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

.action > :global(*) {
    margin-top: 10px;
}

.subactions {
    display: flex;
    flex-direction: column;
}

.subaction-title {
    font-weight: bold;
    margin-bottom: 5px;
}
</style>
