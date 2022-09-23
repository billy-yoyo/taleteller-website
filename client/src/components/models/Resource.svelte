<script lang="ts">
import type { ObjectID } from "../../models/objectId";

import type { IResource } from "../../models/resource";
import * as idStore from "../../store/idStore";
import Field from "../common/Field.svelte";

export let resourceId: ObjectID;
let resource: IResource;

const sub = idStore.subscribeManger('resource', resourceId, (model) => {
    resource = model;
});
$: sub(resourceId);

$: deriver = idStore.deriver('resource', resourceId);
$: fieldSync = (field: keyof IResource) => idStore.fieldSync('resource', resourceId, [field]);


</script>

<div class="row">
    <Field title={`(${resource.shortName}) ${resource.name}`} derivation={deriver('amount')} type="number" editable secondDerivation={deriver('maxAmount')} secondIsMax min={0}
        centered doublemargin on:change={fieldSync('amount')} />
</div>

<style>

</style>