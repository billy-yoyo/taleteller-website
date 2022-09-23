<script lang="ts">
import { createEventDispatcher } from "svelte";
import { createAndStoreDefaultModel } from "../../controller/model";
import { ConditionTypeOptions, ConditionType, ICondition, isConditionType } from "../../models/condition";
import type { ObjectID } from "../../models/objectId";
import { Abilities } from "../../models/unit";
import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import { apiToTitle } from "../../util/textHelpers";
import Field from "../common/Field.svelte";
import Editor from "./Editor.svelte";

export let conditionId: ObjectID;
let condition: ICondition<ConditionType>;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('condition', conditionId, (model) => {
    condition = model;
    countChange();
}, true);
$: sub(conditionId);

$: deriver = idStore.deriver('condition', conditionId, true);

$: fieldSync = (field: keyof ICondition<ConditionType>, ...fields: string[]) => idStore.fieldSync('condition', conditionId, [field, ...fields], true);

const AbilityOptions = Abilities.map(ability => ({ value: ability, name: apiToTitle(ability) }));

$: typeSync = fieldSync('type');
$: dataSync = idStore.fieldUpdater('condition', conditionId, ['data'], true);
const setupTypeAndSync = async (e: CustomEvent<{ value: string }>) => {
    const type: ConditionType = e.detail.value as ConditionType;
    if (type === 'and' || type === 'or') {
        if (!(condition.data as any).conditions) {
            dataSync({ conditions: [], ...condition.data });
        }
    } else if (type === 'not') {
        if (!(condition.data as any).condition) {
            const newCondition = await createAndStoreDefaultModel('condition', condition.scope);
            dataSync({ condition: newCondition.id, ...condition.data });
        }
    } else if (type === 'hasAbility') {
        if (!(condition.data as any).ability) {
            dataSync({ ability: 'might', ...condition.data });
        }
    } else if (type == 'hasUpgradeSet') {
        if (!(condition.data as any).tags) {
            dataSync({ tags: [] });
        }
    }
    typeSync(e);
};

$: subconditionFieldSync = idStore.fieldUpdater('condition', conditionId, ['data', 'conditions'], true);
const addSubCondition = async () => {
    const newCondition = await createAndStoreDefaultModel('condition', condition.scope);
    subconditionFieldSync([...(condition.data as any).conditions, newCondition.id]);
};

const deleteSubCondition = (e: CustomEvent<{ id: ObjectID }>) => {
    subconditionFieldSync((condition.data as any).conditions.filter(cid => cid !== e.detail.id));
};

</script>

<div class="condition-editor">
    <Field title="Type" type="select" derivation={deriver('type')} grow editable on:change={setupTypeAndSync} options={ConditionTypeOptions} topmargin/>
    {#if isConditionType(condition, 'hasAbility')}
        <Field title="Ability" type="select" derivation={deriver('data', 'ability')} grow editable on:change={fieldSync('data', 'ability')} options={AbilityOptions} topmargin/>
        <div class="row">
            <Field title="Greater Than" type="number" derivation={deriver('data', 'greaterThan')} grow editable nullable on:change={fieldSync('data', 'greaterThan')} topmargin/>
            <Field title="Less Than" type="number" derivation={deriver('data', 'lessThan')} grow editable nullable on:change={fieldSync('data', 'lessThan')} topmargin/>
        </div>
    {:else if isConditionType(condition, 'hasFeature')}
        <Field title="Tags" type="array" derivation={deriver('data', 'tags')} grow editable on:change={fieldSync('data', 'tags')} topmargin/>
    {:else if isConditionType(condition, 'hasLevel')}
        <Field title="Greater Than" type="number" derivation={deriver('data', 'greaterThan')} grow editable on:change={fieldSync('data', 'greaterThan')} topmargin/>
    {:else if isConditionType(condition, 'hasUpgradeSet')}
        <Field title="API Name" type="string" derivation={deriver('data', 'apiName')} grow editable nullable on:change={fieldSync('data', 'apiName')} topmargin/>
        <Field title="Tags" type="array" derivation={deriver('data', 'tags')} grow editable on:change={fieldSync('data', 'tags')} topmargin/>
    {:else if isConditionType(condition, 'and') || isConditionType(condition, 'or')}
        <div class="subconditions">
            {#each condition.data.conditions as conditionId}
                <Editor type="condition" modelId={conditionId} box deletable on:delete={deleteSubCondition}/>
            {/each}
        </div>
        <button class="add" on:click={addSubCondition}>Add Condition</button>
    {:else if isConditionType(condition, 'not')}
        <Editor type="condition" modelId={condition.data.condition} box/>
    {/if}
</div>

<style>
    .condition-editor {
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
        width: 100%;
    }

    .subconditions {
        display: flex;
        flex-direction: column;
    }

    button {
        cursor: pointer;
        display: flex;
        flex-direction: row;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
        margin-top: 10px;
    }
</style>