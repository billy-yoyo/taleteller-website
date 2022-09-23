<script lang="ts">
import type { UnitID } from "../../../models/unit";
import type { RollRepr } from "../../../rolling/rollrepr";
import * as idStore from "../../../store/idStore";

export let repr: RollRepr<'abilityMod'>;
export let unitId: UnitID;
let text;

idStore.subscribe(unitId.type, unitId.id, (unit) => {
    if (repr.data.ability === 'agility') {
        text = `${unit.abilities.agility}`;
    } else if (repr.data.ability === 'charisma') {
        text = `${unit.abilities.charisma}`;
    } else if (repr.data.ability === 'intelligence') {
        text = `${unit.abilities.intelligence}`;
    } else if (repr.data.ability === 'might') {
        text = `${unit.abilities.might}`;
    }
});

</script>

<span>
{text}
</span>