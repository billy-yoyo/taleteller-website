<script lang="ts">
import { useNavigate } from "svelte-navigator";

import type { IFeature } from "../../models/feature";
import type { IModel } from "../../models/model";
import type { ObjectID } from "../../models/objectId";
import { checkWriteAccess } from "../../repo/util";
import * as idStore from "../../store/idStore";
import TagList from "../common/TagList.svelte";
import Editor from "../editors/Editor.svelte";
import EditButton from "./EditButton.svelte";

export let featureId: ObjectID;
export let editing: boolean = false;

let feature: IFeature;
let source: IModel;
let unsub: () => void;
let editable: boolean = false;

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

// Deliberately only check this once, require a hard reload. We don't expect scope or user permissions to change frequently.
checkWriteAccess(feature.scope).then(hasAccess => { editable = hasAccess });

$: fullTags = [...(source !== undefined ? [source.name] : []), ...feature.tags];

const navigate = useNavigate();

const startEditing = () => {
    navigate(`/feature/${featureId}/edit`);
};

const stopEditing = () => {
    navigate(`/feature/${featureId}`);
};
</script>


{#if editing && editable}
    <Editor type="feature" modelId={featureId} stoppable on:stop={stopEditing}/>
{:else}
    <div class="feature">
        <div class="title-bar">
            <div class="row">
                <div class="name-column">
                    <div class="title">
                        <div class="title-text">
                            {feature.name}
                        </div>
                        {#if editable}
                            <EditButton on:edit={startEditing}>
                                Edit
                            </EditButton>
                        {/if}
                    </div>
                    {#if source !== undefined || feature.tags.length > 0}
                        <TagList tags={fullTags} titlecase/>
                    {/if}
                </div>
            </div>
        </div>
        <div class="description">
            {feature.description}
        </div>
    </div>
{/if}

<style>
    .feature {
        margin-top: 10px;
    }

    .title-bar {
        display: flex;
        flex-direction: column;
        padding: 5px 7px;
    }

    .row {
        display: flex;
        flex-direction: row;
        align-items: center;
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

    .name-column {
        display: flex;
        flex-direction: column;
        flex: 1;
    }
    
    .description {
        padding: 5px 7px;
    }

</style>