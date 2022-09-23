<script lang="ts">
import { createEventDispatcher } from "svelte";

import type { IFeature } from "../../models/feature";
import type { ObjectID } from "../../models/objectId";

import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Field from "../common/Field.svelte";

export let featureId: ObjectID;
let feature: IFeature;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('feature', featureId, (model) => {
    feature = model;
    countChange();
}, true);
$: sub(featureId);

$: deriver = idStore.deriver('feature', featureId, true);
$: fieldSync = (field: keyof IFeature, ...fields: string[]) => idStore.fieldSync('feature', featureId, [field, ...fields], true);

</script>

<div class="feature-editor">
    <Field title="Name" type="string" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70}/>
    <Field title="Description" type="area" derivation={deriver('description')} rows={5} grow editable on:change={fieldSync('description')} max={255} nullable />
    <Field title="Tags" type="array" derivation={deriver('tags')} grow editable on:change={fieldSync('tags')} titlecase />
</div>

<style>
    .feature-editor {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }
</style>
