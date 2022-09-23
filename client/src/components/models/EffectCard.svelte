<script lang="ts">
import type { EffectType, IEffect } from "../../models/effect";
import type { ObjectID } from "../../models/objectId";
import * as idStore from "../../store/idStore";

export let effectId: ObjectID;
let effect: IEffect<EffectType>;

const sub = idStore.subscribeManger('effect', effectId, (model) => {
    effect = model;
});
$: sub(effectId);

$: deriver = idStore.deriver('effect', effectId);

// TODO: finish this component
</script>

<div class="effect">
    
</div>