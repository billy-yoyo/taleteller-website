<script lang="ts">
import { createEventDispatcher } from "svelte";
import type { IActionMod } from "../../models/actionMod";
import type { ObjectID } from "../../models/objectId";
import { parse } from "../../rolling/rollparse";
import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Field from "../common/Field.svelte";
import ResourceCost from "./ResourceCost.svelte";

export let actionModId: ObjectID;
let actionMod: IActionMod;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('actionMod', actionModId, (model) => {
    actionMod = model;
    countChange();
}, true);
$: sub(actionModId);

$: deriver = idStore.deriver('actionMod', actionModId, true);
$: fieldSync = (field: keyof IActionMod, ...fields: string[]) => idStore.fieldSync('actionMod', actionModId, [field, ...fields], true);

$: damageModFieldUpdater = idStore.fieldUpdater('actionMod', actionModId, ['damageModifier'], true);
$: damageModOriginalRollFieldSync = fieldSync('damageModifierOriginalRoll');
let damageModIsValid: boolean = true;
const damageModFieldSync = (event: CustomEvent<{ value: string }>) => {
    const rollString = event.detail.value;
    try {
        const roll = parse(rollString);
        damageModIsValid = true;
        damageModFieldUpdater(roll);
        damageModOriginalRollFieldSync(event);
        dispatch('valid', damageModIsValid && hitModIsValid);
    } catch {
        damageModIsValid = false;
        dispatch('valid', false);
    }
};

$: hitModFieldUpdater = idStore.fieldUpdater('actionMod', actionModId, ['hitModifier'], true);
$: hitModOriginalRollFieldSync = fieldSync('hitModifierOriginalRoll');
let hitModIsValid: boolean = true;
const hitModFieldSync = (event: CustomEvent<{ value: string }>) => {
    const rollString = event.detail.value;
    try {
        const roll = parse(rollString);
        hitModIsValid = true;
        hitModFieldUpdater(roll);
        hitModOriginalRollFieldSync(event);
        dispatch('valid', damageModIsValid && hitModIsValid);
    } catch {
        damageModIsValid = false;
        dispatch('valid', false);
    }
};

</script>

<div class="actionMod-editor">
    <Field title="Name" type="string" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70}/>
    <Field title="Tags" type="array" derivation={deriver('targetTags')} grow editable on:change={fieldSync('targetTags')} titlecase max={70}/>
    <ResourceCost title="Add Resource Cost Modifier" costs={actionMod.costModifiers} on:change={fieldSync('costModifiers')} canBeFree/>
    <Field title="Crit Modifier" type="number" derivation={deriver('critModifier')} editable on:change={fieldSync('critModifier')}/>
    <Field title="Check Modifier" type="string" derivation={deriver('hitModifierOriginalRoll')} grow editable on:change={hitModFieldSync} max={70} error={!hitModIsValid} topmargin/>
    <Field title="Damage Modifier" type="string" derivation={deriver('damageModifierOriginalRoll')} grow editable on:change={damageModFieldSync} max={70} error={!damageModIsValid} topmargin/>
</div>

<style>
    .actionMod-editor {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }
</style>
