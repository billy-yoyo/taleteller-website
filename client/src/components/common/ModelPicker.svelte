<script lang="ts">
import { createEventDispatcher } from "svelte";
import { createAndStoreDefaultModel, ensureModelsInStore } from "../../controller/model";
import type { ICard } from "../../models/card";
import type { FilterableModelType, ModelType } from "../../models/model";
import type { ObjectID } from "../../models/objectId";
import type { IScope } from "../../models/scope";
import { searchModelsByName } from "../../repo/model";
import { spawnEditor } from "../../store/editors";
import { apiToTitle } from "../../util/textHelpers";
import Field from "./Field.svelte";
import ModelButton from "./ModelButton.svelte";

export let type: ModelType;
export let modelId: ObjectID;
export let scope: IScope;
export let searchScopes: IScope[] = [];
export let searchonly: boolean = false;
export let nolink: boolean = false;

let results: ICard[] = [];

const searchTextChange = async (e: CustomEvent<{ value: string }>) => {
    if (e.detail.value) {
        results = await searchModelsByName(
            type as FilterableModelType,
            e.detail.value,
            5,
            searchScopes.length > 0 ? searchScopes : [scope]
        );
    } else {
        results = [];
    }
};

const dispatch = createEventDispatcher();

const changeModel = () => {
    dispatch('change', { value: undefined });
};

const createModel = async () => {
    const model = await createAndStoreDefaultModel(type, scope);
    dispatch('change', { value: model.id });
};

const selectModel = async (id: ObjectID) => {
    await ensureModelsInStore([ { type, id } ]);
    dispatch('change', { value: id });
};

const editModel = () => {
    spawnEditor({ type, modelId });
};

</script>

<div class="model-picker">
    {#if modelId !== undefined}
        <ModelButton modelId={modelId} modelType={type} nolink={nolink} on:click={editModel}/>
        <div class="buttons">
            <button class="change-model" on:click={changeModel}>Change {apiToTitle(type)}</button>
        </div>
    {:else}
        {#if !searchonly}
            <button class="create-new" on:click={createModel}>Create New {apiToTitle(type)}</button>
        {/if}
        <Field title="Search {apiToTitle(type)} by Name" type="string" fixedValue="" grow editable topmargin on:change={searchTextChange}/>
        <div class="search-results">
            {#each results as result (result.id)}
                <button class="result" on:click={() => selectModel(result.id)}>
                    <div><b>{apiToTitle(result.type)}</b></div>
                    <div>{result.name}</div>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
.model-picker {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 5px;
    border: 1px solid #cfcfcf;
    border-radius: 5px;
}

.create-new {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    border: 1px solid #bfbfbf;
    border-radius: 5px;
    padding: 5px 11px;
    margin: 0;
    background-color: #090916;
    color: #cfcfcf;
    margin-right: 5px;
    margin-top: 10px;
    flex: 1;
}

.change-model {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    border: 1px solid #bfbfbf;
    border-radius: 5px;
    padding: 5px 11px;
    margin: 0;
    background-color: #090916;
    color: #cfcfcf;
    margin-right: 5px;
    margin-top: 10px;
}

.buttons {
    display: flex;
    flex-direction: row;
    justify-content: end;
}

.search-results {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
}

.result {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    border: 1px solid #bfbfbf;
    border-radius: 5px;
    padding: 5px 11px;
    margin: 0;
    background-color: #090916;
    color: #cfcfcf;
    margin-right: 5px;
    margin-top: 10px;
    flex: 1;
}
</style>