<script lang="ts">
import type { UnitID } from "../../../models/unit";
import * as idStore from "../../../store/idStore";

export let unitId: UnitID;
let text;

idStore.subscribe(unitId.type, unitId.id, (unit) => {
    text = `${unit.hitMod}`;
});
</script>

<span>{text}</span>
