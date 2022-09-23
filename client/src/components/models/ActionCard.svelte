<script lang="ts">
import { createEventDispatcher } from "svelte";

import type { IAction } from "../../models/action";
import type { IModel } from "../../models/model";
import type { ObjectID } from "../../models/objectId";
import type { UnitID } from "../../models/unit";
import { spawnEditorIfNotExists } from "../../store/editors";
import * as idStore from "../../store/idStore";
import { titleCase } from "../../util/textHelpers";
import TagList from "../common/TagList.svelte";
import ActionButton from "./ActionButton.svelte";
import EditButton from "./EditButton.svelte";

export let actionId: ObjectID;
export let ownerId: UnitID;
export let tagFilters: string[] = [];
export let nameFilter: string = "";
export let deletable: boolean = false;
let action: IAction;
let source: IModel;
let unsub: () => void;

const sub = idStore.subscribeManger('action', actionId, (model) => {
    action = model;
    if (unsub) {
        unsub();
    }
    if (action.source) {
        unsub = idStore.subscribe(action.source.type, action.source.id, (sourceModel) => { source = sourceModel as IModel; });
    }
});
$: sub(actionId);

$: fullTags = [...(source !== undefined ? [source.name] : []), ...action.tags];

let expanded: boolean = false;

const expandable = action.description !== undefined || action.subactions.length > 0;

const dispatch = createEventDispatcher();

function handleClick() {
    if (expandable) {
        expanded = !expanded;
    }
}

const spawnEditor = () => {
    spawnEditorIfNotExists({
        type: "action",
        modelId: actionId,
        onDelete: deletable ? (modelId) => {
            dispatch('delete', { modelId, name: action.name });
        } : undefined
    });
};

</script>

{#if action.name.toLowerCase().includes(nameFilter.toLowerCase()) && tagFilters.every(f => action.tags.includes(f) || (source !== undefined && source.name.toLowerCase() === f))}
    <div class="action">
        <div class="title-bar" class:expandable={expandable} on:click={handleClick}>
            <div class="row">
                <div class="name-column">
                    <div class="name-container">
                        <div class="name">
                            {action.name}
                        </div>
                        <ActionButton name="Use" actionId={action.id} ownerId={ownerId}/>
                        <EditButton on:edit={spawnEditor}>
                            Edit
                        </EditButton>
                    </div>
                    {#if source !== undefined || action.tags.length > 0}
                        <TagList tags={fullTags} titlecase/>
                    {/if}
                </div>
                
                {#if expandable}
                    <div class="expand">
                        {expanded ? '-' : '+'}
                    </div>
                {/if}
            </div>
        </div>
        {#if expanded}
            <div class="expanded-container">
                {#if action.description !== undefined}
                    <div class="description">
                        {action.description}
                    </div>
                {/if}
                <EditButton on:edit={spawnEditor}>
                    Edit
                </EditButton>
                {#if action.subactions.length > 0}
                    <div class="sub-actions">
                        {#each action.subactions as subaction}
                            <ActionButton actionId={subaction} ownerId={ownerId}/>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
    .action {
        margin-bottom: 10px;
    }

    .title-bar {
        background-color: #15151f;
        border-style: solid;
        border-width: 1px;
        border-color: #efefef;

        display: flex;
        flex-direction: column;
        padding: 5px 7px;
    }

    .expandable {
        cursor: pointer;
    }

    .row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .name-column {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .name-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .name {
        margin-right: 10px;
    }

    .expand {
        font-size: 1.25rem;
        font-weight: bold;
        margin-right: 5px;
    }

    .expanded-container {
        border-style: solid;
        border-top-style: none;
        border-width: 1px;
        border-color: #efefef;
        padding: 5px 7px;
        background-color: #1d1d24;
    }

    .sub-actions {
        margin-top: 5px;
        display: flex;
        flex-direction: row;
    }

    

</style>