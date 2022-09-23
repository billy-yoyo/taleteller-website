<script lang="ts">
import { actionModIsActive, executeAction } from "../../lib/action";
import type { IAction } from "../../models/action";
import type { IActionMod } from "../../models/actionMod";
import type { ObjectID } from "../../models/objectId";
import type { IResourceCost } from "../../models/resourceCost";
import type { UnitID } from "../../models/unit";
import { yesNoDialog } from "../../store/dialogs";
import * as idStore from "../../store/idStore";

export let name: string = undefined;
export let actionId: ObjectID;
export let ownerId: UnitID;
export let light: boolean = false;
export let grow: boolean = false;
export let params: string[] = [];
let action: IAction;
let resourceUnsubs: (() => void)[] = [];
let resourceMap: {[shortName: string]: number} = {};
let actionModUnsubs: (() => void)[] = [];
let actionMods: IActionMod[] = [];

const resourceDeriveSub = idStore.deriveSubManager({ type: ownerId.type, id: ownerId.id, fields: ['resources'] }, (resourceIds: ObjectID[]) => {
    resourceUnsubs.forEach(unsub => unsub());
    resourceUnsubs = [];
    resourceMap = {};

    resourceIds.forEach(resourceId => {
        const unsub = idStore.subscribe('resource', resourceId, (resource) => {
            resourceMap = {
                ...resourceMap,
                [resource.shortName]: resource.amount
            }
        });

        resourceUnsubs.push(unsub);
    });
});
$: resourceDeriveSub({ type: ownerId.type, id: ownerId.id, fields: ['resources'] });

const actionModDeriveSub = idStore.deriveSubManager({ type: ownerId.type, id: ownerId.id, fields: ['actionMods'] }, (actionModIds: ObjectID[]) => {
    actionModUnsubs.forEach(unsub => unsub());
    actionModUnsubs = [];
    actionMods = [];

    actionModIds.forEach(actionModId => {
        const unsub = idStore.subscribe('actionMod', actionModId, (actionMod) => {
            actionMods = [...actionMods, actionMod];
        });

        actionModUnsubs.push(unsub);
    });
});
$: actionModDeriveSub({ type: ownerId.type, id: ownerId.id, fields: ['actionMods'] });

const sub = idStore.subscribeManger('action', actionId, (model) => {
    action = model;
});
$: sub(actionId);

$: isAffordable = (cost: IResourceCost): boolean => {
    const activeMods = actionMods.filter(actionMod => actionModIsActive(action, actionMod)).map(mod => mod.costModifiers).flat();
    const resourceMods = activeMods.filter(mod => mod.resourceShortName === cost.resourceShortName);

    if (cost.makeFree || resourceMods.some(mod => mod.makeFree)) {
        return true;
    }

    let numericCost = cost.amount;
    resourceMods.forEach(mod => numericCost += mod.amount);

    return (resourceMap[cost.resourceShortName] ?? 0) >= numericCost;
};

$: getCostText = (cost: IResourceCost): string => {
    const activeMods = actionMods.filter(actionMod => actionModIsActive(action, actionMod)).map(mod => mod.costModifiers).flat();
    const resourceMods = activeMods.filter(mod => mod.resourceShortName === cost.resourceShortName);

    let flatCost = 0;
    let variableCost = 0;
    if (cost.variable) {
        variableCost += cost.amount;
    } else {
        flatCost += cost.amount;
    }

    resourceMods.forEach(mod => {
        if (mod.variable) {
            variableCost += mod.amount;
        } else {
            flatCost += mod.amount;
        }
    });

    if (variableCost > 0 && flatCost > 0) {
        return `(${variableCost === 1 ? '' : variableCost}x + ${flatCost})${cost.resourceShortName}`;
    } else if (variableCost > 0) {
        return `${variableCost === 1 ? '' : variableCost}x ${cost.resourceShortName}`;
    } else {
        return `${flatCost}${cost.resourceShortName}`;
    }
};

const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const executed = await executeAction(ownerId, action, true, params)
    if (!executed) {
        yesNoDialog(
            'Use Action?',
            `You don't have enough resources to cast that action.\nDo you want to cast it anyway?`,
            () => {
                executeAction(ownerId, action, false, params);
            }
        );
    }
};

</script>

<button class="action-button" class:grow={grow} on:click={handleClick} class:light={light}>
    <div class="name">
        {name ?? action.name}
    </div>
    <div class="costs">
        {#each action.cost as cost}
            <div class="cost" class:affordable={isAffordable(cost)}>
                {getCostText(cost)}
            </div>
        {/each}
    </div>
</button>

<style>
    .action-button {
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

    .grow {
        flex: 1;
    }

    .light {
        background-color: #24242f;
    }

    .action-button:hover {
        background-color: #121219;
    }
    
    .cost {
        margin-left: 3px;
        color: #ff6f6f;
    }

    .cost.affordable {
        color: #6fff6f;
    }
</style>