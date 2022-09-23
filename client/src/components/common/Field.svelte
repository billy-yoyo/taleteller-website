<script lang="ts">
import { createEventDispatcher } from "svelte";
import * as idStore from "../../store/idStore";
import Number from "../common/Number.svelte";
import Textbox from "../common/Textbox.svelte";
import ArrayTextbox from "../common/ArrayTextbox.svelte";
import Textarea from "../common/Textarea.svelte";
import Select from "../common/Select.svelte";
import type { Value, ValueType } from "../../rolling/rollast";
import type { EffectRollCategory } from "../../models/effect";
import type { UnitID } from "../../models/unit";
import ClickRollText from "./ClickRollText.svelte";
import type { ModelType } from "../../models/model";
import ModelPicker from "./ModelPicker.svelte";
import type { IScope } from "../../models/scope";

export let title: string = undefined;
export let type: "string" | "number" | "array" | "area" | "select" | "model" = "string";
export let max: number = undefined;
export let min: number = undefined;
export let rows: number = undefined;
export let cols: number = undefined;
export let options: {name: string, value: any}[] = undefined;
export let secondIsMax: boolean = false;
export let modelType: ModelType = undefined;
export let scope: IScope = undefined;
export let searchScopes: IScope[] = [];

export let roll: Value<ValueType> = undefined;
export let rollCategory: EffectRollCategory = undefined;
export let rollTitle: string = undefined;
export let roller: UnitID = undefined;

export let fixedValue: any = undefined;
export let derivation: idStore.Derivation<any> = undefined;
export let secondFixedValue: any = undefined;
export let secondDerivation: idStore.Derivation<any> = undefined;
export let hideSecond: boolean = false;

export let editable: boolean = false;

export let centered: boolean = false;
export let noline: boolean = false;
export let grow: boolean = false;
export let fullwidth: boolean = false;
export let nomargin: boolean = false;
export let topmargin: boolean = false;
export let doublemargin: boolean = false;
export let big: boolean = false;
export let nullable: boolean = false;
export let error: boolean = false;
export let titlecase: boolean = false;
export let password: boolean = false;

let modelValue;
const sub = derivation && idStore.deriveSubManager(derivation, newValue => {
    //console.log(`field ${derivation.name}.${derivation.fields.join('.')} for id ${derivation.id} was set to ${newValue}`);

    if (!idStore.isLocked(derivation)) {
        if (nullable && newValue === undefined) {
            modelValue = '';
        } else {
            modelValue = newValue;
        }
    }
});
$: derivation && sub(derivation);

let secondModelValue;
const secondSub = secondDerivation && idStore.deriveSubManager(secondDerivation, newValue => {
    secondModelValue = newValue;
});
$: secondDerivation && secondSub(secondDerivation);

$: value = modelValue ?? fixedValue;
$: secondValue = secondModelValue ?? secondFixedValue;

const dispatch = createEventDispatcher();

const onChange = (event: CustomEvent<{ value: any }>) => {
    if (derivation) {
        idStore.unlock(derivation);
    }
    let value = event.detail.value;
    if (nullable && !value) {
        value = undefined;
    }
    dispatch("change", { value });
};

const onInput = (event: CustomEvent<{ value: any }>) => {
    if (derivation) {
        idStore.lock(derivation);
    }
    dispatch("input", { value: event.detail.value });
};

const onSubmit = (event: CustomEvent<{ value: any }>) => {
    if (derivation) {
        idStore.unlock(derivation);
    }
    let value = event.detail.value;
    if (nullable && !value) {
        value = undefined;
    }
    dispatch("submit", { value });
}

</script>

<div class="field" class:grow={grow} class:fullwidth={fullwidth} class:topmargin={topmargin} class:nomargin={nomargin} class:doublemargin={doublemargin} class:big={big} title={title}>
    {#if title !== undefined}
    <div class="title" class:centered={centered}>
        {#if title.trim()}
            {#if roll}
                <ClickRollText roll={roll} rollCategory={rollCategory} rollTitle={rollTitle} roller={roller}>
                    {title}
                </ClickRollText>
            {:else}
                {title}
            {/if}
        {:else}
            <div class="empty">.</div>
        {/if}
    </div>
    {/if}
    <div class="content" class:centered={centered} class:error={error} class:noline={noline || type === "array" || type == "area" || type === "select" || type === "model"}>
        {#if type === "string"}
            <Textbox value={value} error={error} editable={editable} centered={centered} maxlength={secondIsMax ? secondValue : max} password={password} on:change={onChange} on:input={onInput} on:submit={onSubmit}/>
        {:else if type === "number"}
            <Number value={value} error={error} editable={editable} centered={centered} min={min} max={secondIsMax ? secondValue : max} on:change={onChange} on:input={onInput}/>
        {:else if type === "array"}
            <ArrayTextbox tags={value} editable={editable} centered={centered} maxlength={secondIsMax ? secondValue : max} titlecase={titlecase} on:change={onChange}/>
        {:else if type === "area"}
            <Textarea value={value} error={error} editable={editable} centered={centered} maxlength={secondIsMax ? secondValue : max} rows={rows} cols={cols} on:change={onChange} on:input={onInput} on:submit={onSubmit}/>
        {:else if type === "select"}
            <Select value={value} options={options} editable={editable} on:change={onChange} on:input={onInput}/>
        {:else if type === "model"}
            <ModelPicker modelId={value} type={modelType} scope={scope} searchScopes={searchScopes} on:change={onChange}/>
        {/if}

        {#if secondValue !== undefined && !hideSecond}
            /
            {#if type === "string"}
                <Textbox value={secondValue} centered={centered}/>
            {:else if type === "number"}
                <Number value={secondValue} centered={centered}/>
            {:else if type === "array"}
                <ArrayTextbox tags={secondValue} centered={centered} titlecase={titlecase}/>
            {:else if type === "area"}
                <Textarea value={secondValue} centered={centered} rows={rows} cols={cols}/>
            {:else if type === "select"}
                <Select value={secondValue} options={options}/>
            {:else if type === "model"}
                <ModelPicker modelId={secondValue} type={modelType} searchScopes={searchScopes} scope={scope}/>
            {/if}
        {/if}
    </div>
</div>

<style>
    .empty {
        color: #00000000;
    }

    .title {
        display: flex;
        font-size: 0.75rem;
        color: #d1d1d1;
    }

    .grow {
        flex: 1;
    }

    .fullwidth {
        width: 100%;
    }

    .field {
        margin-right: 10px;
    }

    .doublemargin {
        margin-right: 20px;
    }

    .nomargin {
        margin-right: 0px;
    }
    
    .content {
        display: flex;
        border-color: #d1d1d1;
        border-bottom-style: solid;
        border-width: 1px;
    }

    .error {
        border-bottom-color: #ff6f6f;
    }

    .noline {
        border-bottom-style: none;
    }

    .centered {
        justify-content: center;
        text-align: center;
    }

    .big .title {
        font-size: 1rem;
    }
    .big .content {
        font-size: 1.5rem;
        border-width: 2px;
    }

    .topmargin {
        margin-bottom: 5px;
    }
</style>