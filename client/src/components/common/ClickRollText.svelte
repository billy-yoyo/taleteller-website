<script lang="ts">
import { executeEffects } from "../../lib/action";
import type { ModelType } from "../../models/model";
import type { UnitID } from "../../models/unit";
import type { Value, ValueType } from "../../rolling/rollast";
import { buildRollStringFromValue, RollCategory } from "../../rolling/roller";
import type { Derivation } from "../../store/idStore";
import * as idStore from "../../store/idStore";

export let roll: Value<ValueType>;
export let rollCategory: RollCategory;
export let rollTitle: string;
export let roller: UnitID;
export let proficiencyDerivation: Derivation<ModelType> = undefined;

let proficiency;
const sub = proficiencyDerivation && idStore.deriveSubManager(proficiencyDerivation, (model) => {
    proficiency = model;
});
$: proficiencyDerivation && sub(proficiencyDerivation);

const getOptions = () => {
    return { proficiency, category: rollCategory };
}


const onClick = () => {
    // create a mock effect to execute
    executeEffects(roller, rollTitle, undefined, [{
        id: "",
        type: 'roll',
        data: { roll, originalRoll: '', options: getOptions() },
        scope: { type: 'global' } }],
    [], []);
};
</script>

<span on:click={onClick} title={buildRollStringFromValue(roll)}><slot></slot></span>

<style>
    span:hover {
        cursor: pointer;
        text-decoration: underline;
        width: 100%;
        flex: 1;
    }
</style>