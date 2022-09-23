<script lang="ts">
import { dataset_dev } from "svelte/internal";
import { ConditionData, ConditionType, ICondition, isConditionType } from "../../models/condition";
import type { ObjectID } from "../../models/objectId";
import * as idStore from "../../store/idStore";
import { apiToTitle } from "../../util/textHelpers";

export let conditionId: ObjectID;
let condition: ICondition<ConditionType>;

const sub = idStore.subscribeManger('condition', conditionId, (model) => { condition = model; });
$: sub(conditionId);

const cast = (x: any): any => x;

const getAbilityConditionText = (data: ConditionData<'hasAbility'>): string => {
    const ability = apiToTitle(data.ability);
    if (data.greaterThan !== undefined && data.lessThan !== undefined) {
        return `${data.greaterThan} < ${ability} < ${data.lessThan}`;
    } else if (data.greaterThan !== undefined) {
        return `${ability} > ${data.greaterThan}`;
    } else if (data.lessThan !== undefined) {
        return `${ability} < ${data.lessThan}`
    } else {
        return ability;
    }
};

</script>

<div class="condition">
    {#if isConditionType(condition, 'and')}
        <span>(</span>
        <svelte:self conditionId={condition.data.conditions[0]}/>
        {#each cast(condition.data).conditions.slice(1) as conditionId}
            <span>AND</span>
            <svelte:self conditionId={conditionId}/>
        {/each}
        <span>)</span>
    {:else if isConditionType(condition, 'or')}
        <span>(</span>
        <svelte:self conditionId={condition.data.conditions[0]}/>
        {#each cast(condition.data).conditions.slice(1) as conditionId}
            <span>OR</span>
            <svelte:self conditionId={conditionId}/>
        {/each}
        <span>)</span>
    {:else if isConditionType(condition, 'not')}
        <span>NOT</span>
        <svelte:self conditionId={condition.data.condition}/>
    {:else if isConditionType(condition, 'hasAbility')}
        {getAbilityConditionText(condition.data)}
    {:else if isConditionType(condition, 'hasFeature')}
        <span>{`Have a feature with the following tag(s): ${condition.data.tags.map(apiToTitle).join(', ')}`}</span>
    {:else if isConditionType(condition, 'hasUpgradeSet')}
        {#if condition.data.tags !== undefined && condition.data.apiName !== undefined}
            {`Have an upgrade set with API name ${apiToTitle(condition.data.apiName)} and tags ${condition.data.tags.map(apiToTitle).join(',')}`}
        {:else if condition.data.apiName !== undefined}
            {`Have an upgrade set with API name ${apiToTitle(condition.data.apiName)}`}
        {:else if condition.data.tags !== undefined}
            {`Have an upgrade set with tags ${condition.data.tags.map(apiToTitle).join(',')}`}
        {:else}
            {`Have an upgrade set`}
        {/if}
    {:else if isConditionType(condition, 'empty')}
        <span>Nothing</span>
    {/if}
</div>
