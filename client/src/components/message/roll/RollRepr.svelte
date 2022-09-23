<script lang="ts">
import type { RollRepr } from "../../../rolling/rollrepr";

export let repr: RollRepr<'roll'>;
const critRange = repr.data.critRange;

let joiner = repr.data.method === 'sum' ? '+' : ',';
</script>


{#if repr.data.method !== 'sum'}
<span>{repr.data.method}</span> 
{/if}
<span>(</span>
<span class="roll"
      class:included={repr.data.rolls[0].included}
      class:success={repr.data.rolls[0].value >= critRange[1]}
      class:fail={repr.data.rolls[0].value <= critRange[0]}>
    {repr.data.rolls[0].value}
</span>
{#each repr.data.rolls.slice(1) as roll}
<span>{joiner}</span>
<span class="roll"
      class:included={roll.included}
      class:success={roll.value >= critRange[1]}
      class:fail={roll.value <= critRange[0]}>
    {roll.value}
</span>
{/each}
<span>)</span>

<style>
    .roll {
        margin-left: 3px;
        margin-right: 3px;
        width: 1.25rem;
        height: 1.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;

        border: 1px solid #9f9f9f;
        background-color: #0f0f16;
        color: #bfbfbf;
    }

    .included {
        border: 1px solid #bfbfbf;
        background-color: unset;
        color: unset;
    }

    .success {
        color: #6fff6f;
    }

    .fail {
        color: #ff6f6f;
    }
</style>