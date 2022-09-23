<script lang="ts">
import type { UnitID } from "../../models/unit";
import type { RollOptions } from "../../rolling/roller";

import { isReprType, RollRepr, RollReprType } from "../../rolling/rollrepr";
import AbilityModRoll from "./roll/AbilityModRepr.svelte";
import DivideRepr from "./roll/DivideRepr.svelte";
import FlatModRepr from "./roll/FlatModRepr.svelte";
import FuncRepr from "./roll/FuncRepr.svelte";
import HitModRepr from "./roll/HitModRepr.svelte";
import MultiplyRepr from "./roll/MultiplyRepr.svelte";
import NegateRepr from "./roll/NegateRepr.svelte";
import ProficiencyModRepr from "./roll/ProficiencyModRepr.svelte";
import RollReprComponent from "./roll/RollRepr.svelte";
import SumRepr from "./roll/SumRepr.svelte";
import VariableModRepr from "./roll/VariableModRepr.svelte";

export let repr: RollRepr<RollReprType>;
export let unitId: UnitID;
export let options: RollOptions;

</script>

{#if isReprType(repr, 'abilityMod')}
    <AbilityModRoll unitId={unitId} repr={repr} />
{:else if isReprType(repr, 'divide')}
    <DivideRepr unitId={unitId} repr={repr} options={options} />
{:else if isReprType(repr, 'flatMod')}
    <FlatModRepr repr={repr}/>
{:else if isReprType(repr, 'func')}
    <FuncRepr unitId={unitId} repr={repr} options={options} />
{:else if isReprType(repr, 'hitMod')}
    <HitModRepr unitId={unitId}/>
{:else if isReprType(repr, 'proficiencyMod')}
    <ProficiencyModRepr options={options}/>
{:else if isReprType(repr, 'variableMod')}
    <VariableModRepr variable={repr.data.variable} options={options}/>
{:else if isReprType(repr, 'multiply')}
    <MultiplyRepr unitId={unitId} repr={repr} options={options} />
{:else if isReprType(repr, 'negate')}
    <NegateRepr unitId={unitId} repr={repr} options={options} />
{:else if isReprType(repr, 'roll')}
    <RollReprComponent repr={repr}/>
{:else if isReprType(repr, 'sum')}
    <SumRepr unitId={unitId} repr={repr} options={options} />
{/if}
