<script lang="ts">
import { createEventDispatcher } from "svelte";

import { get, writable } from "svelte/store";

import type { FilterableModelType } from "../../models/model";
import type { ObjectID } from "../../models/objectId";
import type { IScope } from "../../models/scope";
import PaginatedView from "../pagination/PaginatedView.svelte";

export let type: FilterableModelType;
export let scopes: IScope[];
export let baseFilters: any = {};
export let sortMethods: { name: string, value: string }[];
export let maxPoints: number;

let spentPoints = writable<number>(0);
let selection = writable<ObjectID[]>([]);

const dispatch = createEventDispatcher();

dispatch('select', { selected: [] });

const pointBuySelector = (e: CustomEvent<{ id: any, cost: number }>) => {
    const id = e.detail.id;
    const cost = e.detail.cost ?? 1;
    selection.update(selected => {
        if (selected.includes(id)) {
            spentPoints.update(spent => spent - cost);
            return selected.filter(x => x !== id);
        } else if (get(spentPoints) + cost <= maxPoints) {
            spentPoints.update(spent => spent + cost);
            return [ ...selected, id ];
        } else {
            return selected;
        }
    });

    dispatch('select', { selected: get(selection) });
};

</script>

<div class="point-buy-selection">
    <div class="title">You have {maxPoints - $spentPoints} points left</div>
    <PaginatedView type={type} limit={10} scopes={scopes} baseFilters={baseFilters}
                   sortMethods={sortMethods} selected={$selection} customclick on:click={pointBuySelector} />
</div>
