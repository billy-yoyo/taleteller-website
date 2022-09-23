<script lang="ts">
import ActionEditor from "./ActionEditor.svelte";
import EditorButtons from "./EditorButtons.svelte";
import * as idStore from "../../store/idStore";
import type { ModelType } from "../../models/model";
import EffectEditor from "./EffectEditor.svelte";
import { apiToTitle } from "../../util/textHelpers";
import { createEventDispatcher } from "svelte";
import ClassEditor from "./ClassEditor.svelte";
import ConditionEditor from "./ConditionEditor.svelte";
import UpgradeSetEditor from "./UpgradeSetEditor.svelte";
import UpgradeEditor from "./UpgradeEditor.svelte";
import FeatureEditor from "./FeatureEditor.svelte";
import ItemEditor from "./ItemEditor.svelte";
import type { ObjectID } from "../../models/objectId";
import ActionModEditor from "./ActionModEditor.svelte";

export let type: ModelType;
export let modelId: ObjectID;
export let box: boolean = false;
export let deletable: boolean = false;
export let stoppable: boolean = false;

let valid: boolean = true;
let changes: boolean = false;

const dispatch = createEventDispatcher();

console.log(`editor deletable: ${deletable}`)

const onValid = (e: CustomEvent<boolean>) => {
    valid = e.detail;
};

const onChange = () => {
    changes = true;
};

const onSave = () => {
    idStore.finishEditing(type, modelId);
    changes = false;
};

const onReset = () => {
    idStore.startEditing(type, modelId);
    changes = false;
};

const onDelete = () => {
    dispatch('delete', { id: modelId });
};

const onStop = () => {
    dispatch('stop', { id: modelId });
};

</script>

<div class="editor" class:box={box}>
    {#if type === 'action'}
        <ActionEditor actionId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'effect'}
        <EffectEditor effectId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'class'}
        <ClassEditor classId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'condition'}
        <ConditionEditor conditionId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'upgradeSet'}
        <UpgradeSetEditor upgradeSetId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'upgrade'}
        <UpgradeEditor upgradeId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'feature'}
        <FeatureEditor featureId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'item'}
        <ItemEditor itemId={modelId} on:valid={onValid} on:change={onChange}/>
    {:else if type === 'actionMod'}
        <ActionModEditor actionModId={modelId} on:valid={onValid} on:change={onChange}/>
    {/if}
    <EditorButtons name={apiToTitle(type)} valid={valid} changes={changes} deletable={deletable} stoppable={stoppable}
                on:save={onSave} on:reset={onReset} on:delete={onDelete} on:stop={onStop}/>
</div>

<style>
    .box {
        border: 1px solid #efefef;
        padding: 0px 10px;
        background-color: #06060f;
        margin-bottom: 10px;
    }
</style>
