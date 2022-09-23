<script lang="ts">
import type { ICard } from "../../models/card";
import CardComponent from "../cards/Card.svelte";
import type { FilterableModelType } from "../../models/model";
import { IPagination, scopeArray } from "../../models/pagination";
import type { IScope } from "../../models/scope";
import { search } from "../../repo/model";
import Field from "../common/Field.svelte";
import { combineFilters } from "../../util/filterHelper";
import { checkWriteAccess } from "../../repo/util";
import { createEventDispatcher } from "svelte";
import type { ObjectID } from "../../models/objectId";
import { spawnYesNoDialogAndWaitForAnswer } from "../../store/dialogs";
import { apiToTitle } from "../../util/textHelpers";

export let type: FilterableModelType;
export let sortMethods: { name: string, value: string }[];
export let limit: number;
export let page: number = 0;
export let scopes: IScope[];
export let baseFilters: any = {};
export let creatable: boolean = false;
export let deletable: boolean = false;
export let customclick: boolean = false;
export let selected: ObjectID[] = [];
export let session = 1;

let sort: string;
let pagination: IPagination;
$: pagination = {
    page,
    limit,
    sort,
    scopes: scopeArray(...scopes)
};

let filters: any = {};
let hideFilters: boolean = true;
let pagePromise: Promise<ICard[]>;
let canCreate: boolean = false;

// Deliberately only check this once, require a hard reload. We don't expect scope or user permissions to change frequently.
checkWriteAccess(...scopes).then(hasAccess => { canCreate = hasAccess });

$: combinedFilters = combineFilters(baseFilters, pagination, filters)
$: pagePromise = session && search(type, combinedFilters);

const dispatch = createEventDispatcher();

const onChangeFilters = (e: CustomEvent<{ filters: any }>) => {
    filters = e.detail.filters;
};

const onChangeSort = (e: CustomEvent<{ value: string }>) => {
    sort = e.detail.value;
};

const toggleFilters = () => {
    hideFilters = !hideFilters;
};

const prevPage = () => {
    if (page > 0) {
        page = page - 1;
    }
};

const nextPage = () => {
    page = page + 1;
};

const createNew = () => {
    dispatch('create');
};

const onDelete = async (e: CustomEvent<{ id: ObjectID, name: string }>) => {
    const deleteConfirmed = await spawnYesNoDialogAndWaitForAnswer(`Delete ${apiToTitle(type)}?`, `Are you sure you want to delete the ${apiToTitle(type)} with name '${e.detail.name}'?`);
    if (deleteConfirmed) {
        dispatch('delete', { id: e.detail.id });
    }
};

const onClick = (e: CustomEvent<{ id: ObjectID, cost: number }>) => {
    dispatch('click', { id: e.detail.id, cost: e.detail.cost });
}

</script>

<div class="pagination">
    <div class="header">
        <div class="top-bar">
            <Field title="Sort By" type="select" fixedValue={sort} editable on:change={onChangeSort} options={sortMethods} topmargin/>
            <button on:click={toggleFilters}>{ hideFilters ? "Show Filters" : "Hide Filters" }</button>
            <div class="filler"></div>
            {#if creatable && canCreate}
                <button on:click={createNew}>New</button>
            {/if}
            <button on:click={prevPage}>{"<"}</button>
            <div class="page-number">{page+1}</div>
            <button on:click={nextPage}>{">"}</button>
        </div>
        {#if !hideFilters}
            <div class="filters">
                filters
            </div>
        {/if}
    </div>
    <div class="page">
        {#await pagePromise}
            Loading...
        {:then cards}
            {#each cards as card (card.id)}
                <CardComponent card={card} deletable={deletable && canCreate} customclick={customclick} selected={selected.includes(card.id)} on:delete={onDelete} on:click={onClick}></CardComponent>
            {/each}
        {:catch e}
            {`Failed to load page: ${e}`}
        {/await}
    </div>
</div>

<style>
    .pagination {
        display: flex;
        flex-direction: column;
        border-left-style: solid;
        border-right-style: solid;
        border-bottom: solid;
        border-width: 1px;
        border-color: #cfcfcf;
    }

    .header {
        display: flex;
        flex-direction: column;
    }

    .top-bar {
        background-color: #12121a;
        border-bottom-style: solid;
        border-width: 1px;
        border-color: #cfcfcf;
        display: flex;
        flex-direction: row;
        padding: 10px;
        align-items: center;
    }

    .filters {
        background-color: #0f0f18;
        border-bottom-style: solid;
        border-width: 1px;
        border-color: #cfcfcf;
        display: flex;
        flex-direction: row;
        padding: 10px;
    }

    .filler {
        flex: 1;
    }

    button {
        cursor: pointer;
        display: flex;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 7px 10px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
        margin-bottom: -3px;
    }

    .filters {
        padding: 10px;
    }

    .page {
        padding: 10px;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .page-number {
        display: flex;
        padding: 2px 10px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
        margin-bottom: -3px;
        font-size: 1.5rem;
        font-weight: bold;
    }
</style>