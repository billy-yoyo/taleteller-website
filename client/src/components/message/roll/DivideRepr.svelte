<script lang="ts">
import type { UnitID } from "../../../models/unit";
import type { RollOptions } from "../../../rolling/roller";
import type { RollRepr } from "../../../rolling/rollrepr";
import Roll from "../Roll.svelte";

export let repr: RollRepr<'divide'>;
export let unitId: UnitID;
export let options: RollOptions;
</script>

<Roll unitId={unitId}  repr={repr.data.value} options={options} /> / <Roll unitId={unitId}  repr={repr.data.divisor} options={options} />

