<script lang="ts">
import { createEventDispatcher } from "svelte";
import type { ModelType } from "../../models/model";
import type { ObjectID } from "../../models/objectId";
import * as idStore from "../../store/idStore";
import { apiToTitle } from "../../util/textHelpers";

export let modelId: ObjectID;
export let modelType: ModelType;
export let nolink: boolean = false;
let model;

const sub = idStore.subscribeManger(modelType, modelId, (newModel) => {
    model = newModel;
});
$: sub(modelId);

const dispatch = createEventDispatcher();

const onClick = () => {
    if (!nolink) {
        dispatch('click', { id: modelId });
    }
}

</script>

<button on:click={onClick} disabled={nolink}>
    <div><b>{apiToTitle(modelType)}</b></div>
    <div>{model.name}</div>
</button>

<style>
    button {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
        margin-top: 10px;
        flex: 1;
    }
</style>
