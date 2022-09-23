<script lang="ts">
import { createEventDispatcher } from "svelte";
import { createAndStoreDefaultModel } from "../../controller/model";
import { EffectRollCategoryOptions, EffectType, EffectTypeOptions, IEffect, isEffectType } from "../../models/effect";
import type { ObjectID } from "../../models/objectId";
import { parse } from "../../rolling/rollparse";
import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Field from "../common/Field.svelte";
import Editor from "./Editor.svelte";

export let effectId: ObjectID;
let effect: IEffect<EffectType>;
let isValid: boolean = true;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('effect', effectId, (model) => {
    effect = model;
    countChange();
}, true);
$: sub(effectId);


$: deriver = idStore.deriver('effect', effectId, true);
$: fieldSync = (field: keyof IEffect<EffectType>, ...fields: string[]) => idStore.fieldSync('effect', effectId, [field, ...fields], true);

$: typeSync = fieldSync('type');
$: dataSync = idStore.fieldUpdater('effect', effectId, ['data'], true);
const setupTypeAndSync = async (e: CustomEvent<{ value: string }>) => {
    const type: EffectType = e.detail.value as EffectType;
    if (type === 'ifParam') {
        if (!(effect.data as any).thenEffectId) {
            const thenEffect = await createAndStoreDefaultModel('effect', effect.scope);
            const elseEffect = await createAndStoreDefaultModel('effect', effect.scope);

            dataSync({ thenEffectId: thenEffect.id, elseEffectId: elseEffect.id, ...effect.data });
        }
    } else if (type === 'roll') {
        if (!(effect.data as any).category) {
            dataSync({ options: { category: 'check' }, ...effect.data })
        }
    }
    typeSync(e);
};

$: rollFieldUpdater = idStore.fieldUpdater('effect', effectId, ['data', 'roll'], true);
$: originalRollFieldSync = fieldSync('data', 'originalRoll');
const rollFieldSync = (event: CustomEvent<{ value: string }>) => {
    const rollString = event.detail.value;
    try {
        const roll = parse(rollString);
        isValid = true;
        rollFieldUpdater(roll);
        originalRollFieldSync(event);
        dispatch('valid', true);
    } catch {
        isValid = false;
        dispatch('valid', false);
    }
};

</script>

<div class="effect-editor">
    <div class="title">
        Effect
    </div>
    <div class="container">
        <Field title="Type" type="select" derivation={deriver('type')} grow editable on:change={setupTypeAndSync} options={EffectTypeOptions}/>
        {#if isEffectType(effect, 'roll')}
            <Field title="Roll" type="string" derivation={deriver('data', 'originalRoll')} grow editable on:change={rollFieldSync} max={70} error={!isValid} topmargin/>
            <Field title="Type" type="select" derivation={deriver('data', 'category')} grow editable on:change={fieldSync('data', 'category')} options={EffectRollCategoryOptions} topmargin/>
        {:else if isEffectType(effect, 'button')}
            <Field title="Action" type="model" modelType="action" scope={effect.scope} derivation={deriver('data', 'actionId')} grow editable on:change={fieldSync('data', 'actionId')} topmargin/>
        {:else if isEffectType(effect, 'addParam')}
            <Field title="Parameter" type="string" derivation={deriver('data', 'param')} grow editable on:change={fieldSync('data', 'param')} topmargin/>
        {:else if isEffectType(effect, 'ifParam')}
            <Field title="Parameter" type="string" derivation={deriver('data', 'param')} grow editable on:change={fieldSync('data', 'param')} topmargin/>
            <div class="sub-effect">
                <div class="sub-effect-title">
                    If Parameter Exists:
                </div>
                <div class="sub-effect-editor">
                    <Editor type="effect" modelId={effect.data.thenEffectId} box/>
                </div>
            </div>
            <div class="sub-effect">
                <div class="sub-effect-title">
                    Otherwise:
                </div>
                <div class="sub-effect-editor">
                    <Editor type="effect" modelId={effect.data.elseEffectId} box/>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .effect-editor {
        display: flex;
        flex-direction: column;
    }

    .title {
        font-size: 1.25rem;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .sub-effect {
        display: flex;
        flex-direction: column;
    }

    .sub-effect-title {
        font-weight: bold;
    }
</style>