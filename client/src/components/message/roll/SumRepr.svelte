<script lang="ts">
import type { UnitID } from "../../../models/unit";
import type { RollOptions } from "../../../rolling/roller";

import { isReprType, RollRepr, RollReprType } from "../../../rolling/rollrepr";
import Roll from "../Roll.svelte";

export let repr: RollRepr<'sum'>;
export let unitId: UnitID;
export let options: RollOptions;

</script>

<Roll unitId={unitId} repr={repr.data.values[0]} options={options}/>
{#each repr.data.values.slice(1) as val}
    {#if isReprType(val, 'negate')}
        - <Roll unitId={unitId} repr={val.data.value} options={options} />
    {:else}
        + <Roll unitId={unitId} repr={val} options={options} />
    {/if}
{/each}
