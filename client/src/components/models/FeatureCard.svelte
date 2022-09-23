<script lang="ts">
import { createEventDispatcher } from "svelte";

import type { IFeature } from "../../models/feature";
import type { IModel } from "../../models/model";
import type { ObjectID } from "../../models/objectId";
import { spawnEditorIfNotExists } from "../../store/editors";
import * as idStore from "../../store/idStore";
import TagList from "../common/TagList.svelte";
import EditButton from "./EditButton.svelte";

export let featureId: ObjectID;
export let nameFilter: string = "";
export let deletable: boolean = false;
let feature: IFeature;
let source: IModel;
let unsub: () => void;

const sub = idStore.subscribeManger('feature', featureId, (model) => {
    feature = model;
    if (unsub) {
        unsub();
    }
    if (feature.source) {
        unsub = idStore.subscribe(feature.source.type, feature.source.id, (sourceModel) => { source = sourceModel as IModel; });
    }
});
$: sub(featureId);

$: fullTags = [...(source !== undefined ? [source.name] : []), ...feature.tags];

let expanded: boolean = false;

const dispatch = createEventDispatcher();

function handleClick() {
    expanded = !expanded;
}

const spawnEditor = () => {
    spawnEditorIfNotExists({
        type: "feature",
        modelId: featureId,
        onDelete: deletable ? (modelId) => {
            dispatch('delete', { modelId, name: feature.name });
        } : undefined
    });
};

</script>

{#if feature.name.toLowerCase().includes(nameFilter.toLowerCase())}
    <div class="feature">
        <div class="title-bar" on:click={handleClick}>
            <div class="row">
                <div class="name-column">
                    <div class="name">
                        {feature.name}
                    </div>
                    {#if source !== undefined || feature.tags.length > 0}
                        <TagList tags={fullTags} titlecase/>
                    {/if}
                </div>
                <div class="expand">
                    {expanded ? '-' : '+'}
                </div>
            </div>
        </div>
        {#if expanded}
            <div class="description">
                <div>
                    {feature.description}
                </div>
                <EditButton on:edit={spawnEditor}>
                    Edit
                </EditButton>
            </div>
        {/if}
    </div>
{/if}

<style>
    .feature {
        margin-top: 10px;
    }

    .title-bar {
        background-color: #15151f;;
        cursor: pointer;
        border-style: solid;
        border-width: 1px;
        border-color: #efefef;

        display: flex;
        flex-direction: column;
        padding: 5px 7px;
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

    .expand {
        font-size: 1.25rem;
        font-weight: bold;
        margin-right: 5px;
    }
    
    .description {
        border-style: solid;
        border-top-style: none;
        border-width: 1px;
        border-color: #efefef;
        padding: 5px 7px;
        background-color: #1d1d24;
    }

</style>