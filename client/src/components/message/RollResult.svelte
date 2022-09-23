<script lang="ts">
import { modifyRoll, RollOptions, RollResult } from "../../rolling/roller";
import { buildRollString, getHitType, RollReprType } from "../../rolling/rollrepr";
import Roll from "./Roll.svelte";
import * as idStore from "../../store/idStore";
import type { EffectRollCategory } from "../../models/effect";
import { updateAndStoreMessage } from "../../controller/chat";
import type { ObjectID } from "../../models/objectId";

export let sectionId: string;
export let messageId: ObjectID;
export let result: RollResult<RollReprType>;
export let options: RollOptions;

$: hitType = getHitType(result.repr);

const increaseRoll = () => {
    const newResult = modifyRoll(
        idStore.getModel(result.roller.type, result.roller.id),
        result,
        options.category === 'damage' ? 'max' : 'normal',
        options.category === 'check' ? 'lowest' : 'none'
    );
    updateAndStoreMessage(messageId, [{
        id: sectionId,
        type: 'roll',
        data: {
            roll: newResult,
            options
        }
    }]);
};

const decreaseRoll = () => {
    const newResult = modifyRoll(
        idStore.getModel(result.roller.type, result.roller.id),
        result,
        options.category === 'damage' ? 'min' : 'normal',
        options.category === 'check' ? 'highest' : 'none'
    );
    updateAndStoreMessage(messageId, [{
        id: sectionId,
        type: 'roll',
        data: {
            roll: newResult,
            options
        }
    }]);
};

</script>

<div class="roll">
    <div class="repr" title={buildRollString(result.repr)}>
        <Roll unitId={result.roller} repr={result.repr} options={options}/>
    </div>
    <div class="value-container" class:success={hitType === 'success'} class:fail={hitType === 'fail'}>
        <button class="mod minus" on:click={decreaseRoll}> <span>-</span> </button>
        <div class="value">
            {result.value}
        </div>
        <button class="mod plus" on:click={increaseRoll}> <span>+</span> </button>
    </div>
</div>


<style>
    .roll {
        display: flex;
        flex-direction: column;
        border: 1px solid #59595f;
        margin: 10px 3px;
        border-radius: 5px;
    }

    .repr {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        border-bottom: 1px solid #59595f;
        box-sizing: border-box;
        padding: 5px;
    }

    .value-container {
        width: 100%;
        font-weight: bold;
        font-size: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
        box-sizing: border-box;
    }

    .mod {
        border: 1px solid #59595f;
        background-color: #24242f;
        color: #cfcfcf;
        width: 1.5rem;
        height: 1.5rem;
        font-size: 1rem;
        margin: 0;
        padding: 3px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        margin-top: -3px;
        cursor: pointer;
    }

    .mod span {
        margin-top: -3px;
    }

    .value {
        flex: 1;
        display: flex;
        justify-content: center;
    }

    .success {
        color: #6fff6f;
    }

    .fail {
        color: #ff6f6f;
    }
</style>