<script lang="ts">
import type { UnitID } from "../../../models/unit";
import type { RollOptions } from "../../../rolling/roller";

import type { RollRepr } from "../../../rolling/rollrepr";
import Roll from "../Roll.svelte";

export let repr: RollRepr<'func'>;
export let unitId: UnitID;
export let options: RollOptions;
</script>

<span>
    {repr.data.method}
    {'{'} 
    <Roll unitId={unitId} repr={repr.data.values[0]} options={options} />
    {#each repr.data.values.slice(1) as value}
        ,
        <Roll unitId={unitId} repr={value} options={options} />
    {/each}
    {'}'}
</span>
