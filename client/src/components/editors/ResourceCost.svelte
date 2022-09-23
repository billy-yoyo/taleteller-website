<script lang="ts">
import { createEventDispatcher } from "svelte";
import type { IResourceCost } from "../../models/resourceCost";
import Checkbox from "../common/Checkbox.svelte";
import Field from "../common/Field.svelte";
import Tag from "../common/Tag.svelte";

export let costs: IResourceCost[];
export let canBeFree: boolean = false;
export let title: string = 'Add Resource Cost';

const dispatch = createEventDispatcher();

const resourceFieldSync = (costs: IResourceCost[]) => {
    dispatch('change', { value: costs });
}

const resourceCostRegex = /^\s*(-?[0-9]+x?)\s*([a-zA-Z]+)\s*$/
let resourceCost = "";
let resourceError: boolean = false;
const addResourceCost = (e: CustomEvent<{ value: string }>) => {
    const value = e.detail.value;
    const groups = value.match(resourceCostRegex);
    if (groups && groups[0] && groups[1]) {
        const variable = groups[1].endsWith("x")
        const amount = parseInt(variable ? groups[1].slice(0, -1) : groups[1]);
        const resourceShortName = groups[2].toUpperCase();

        if (isNaN(amount)) {
            resourceError = true;
        } else {
            const cost: IResourceCost = { amount, resourceShortName, variable };
            const newCosts = [...costs];
            const existingIndex = newCosts.findIndex(c => c.resourceShortName === cost.resourceShortName);
            if (existingIndex >= 0) {
                const existingCost = newCosts[existingIndex];
                const mergedCost = { resourceShortName, amount: amount + existingCost.amount };
                if (mergedCost.amount > 0) {
                    newCosts[existingIndex] = mergedCost;
                } else {
                    newCosts.splice(existingIndex, 1);
                }
            } else {
                if (cost.amount > 0) {
                    newCosts.push(cost);
                }
            }
            resourceFieldSync(newCosts);
            resourceCost = "";
            resourceError = false;
        }
    } else {
        resourceError = true;
    }
};

const syncResourceCost = (e: CustomEvent<{ value: string }>) => {
    resourceCost = e.detail.value;
};


const resourceCostAmountUpdater = (cost: IResourceCost) => {
    return (e: CustomEvent<{ value: number }>) => {
        resourceFieldSync(costs.map(c => {
            if (c.resourceShortName === cost.resourceShortName) {
                const newCost: IResourceCost = {
                    resourceShortName: c.resourceShortName,
                    amount: e.detail.value,
                    variable: c.variable
                };
                return newCost;
            } else {
                return c;
            }
        }))
    };
};

const resourceVariableUpdater = (cost: IResourceCost) => {
    return (e: CustomEvent<{ value: boolean }>) => {
        resourceFieldSync(costs.map(c => {
            if (c.resourceShortName === cost.resourceShortName) {
                const newCost: IResourceCost = {
                    resourceShortName: c.resourceShortName,
                    amount: c.amount,
                    variable: e.detail.value,
                    makeFree: c.makeFree
                };
                return newCost;
            } else {
                return c;
            }
        }))
    };
};

const resourceFreeUpdater = (cost: IResourceCost) => {
    return (e: CustomEvent<{ value: boolean }>) => {
        resourceFieldSync(costs.map(c => {
            if (c.resourceShortName === cost.resourceShortName) {
                const newCost: IResourceCost = {
                    resourceShortName: c.resourceShortName,
                    amount: c.amount,
                    variable: c.variable,
                    makeFree: e.detail.value
                };
                return newCost;
            } else {
                return c;
            }
        }))
    };
};


const removeResourceCost = (cost: IResourceCost) => {
    resourceFieldSync(costs.filter(c => c.resourceShortName !== cost.resourceShortName));
};

</script>


<Field title={title} type="string" bind:fixedValue={resourceCost} grow editable on:submit={addResourceCost} on:input={syncResourceCost} max={70} error={resourceError}/>
<div class="resource-costs">
    {#each costs as cost (cost.resourceShortName)}
        <div class="cost">
            <button class="cost-remove" on:click={() => removeResourceCost(cost)}>X</button>
            <div class="cost-variable">
                <div class="checkbox-name">
                    Variable
                </div>
                <div class="checkbox">
                    <Checkbox checked={cost.variable} on:change={resourceVariableUpdater(cost)}/>
                </div>
            </div>
            {#if canBeFree}
                <div class="cost-variable">
                    <div class="checkbox-name">
                        Free
                    </div>
                    <div class="checkbox">
                        <Checkbox checked={cost.makeFree} on:change={resourceFreeUpdater(cost)}/>
                    </div>
                </div>
            {/if}
            <Field title="Amount" type="number" fixedValue={cost.amount} editable on:change={resourceCostAmountUpdater(cost)}/>
            <div class="cost-name">{cost.resourceShortName}</div>
            
        </div>
    {/each}
</div>

<style>
.resource-costs {
    display: flex;
    flex-direction: column;
}

.cost {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.cost-remove {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    border: 1px solid #bfbfbf;
    border-radius: 5px;
    padding: 3px 7px;
    margin: 0;
    font-size: 0.75rem;
    background-color: #090916;
    color: #cfcfcf;
    margin-right: 5px;
}

.cost-name {
    margin-right: 5px;
}

.cost-variable {
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>