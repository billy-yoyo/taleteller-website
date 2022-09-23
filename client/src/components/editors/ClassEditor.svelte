<script lang="ts">
import { createEventDispatcher } from "svelte";

import type { IClass } from "../../models/class";
import type { ObjectID } from "../../models/objectId";

import * as idStore from "../../store/idStore";
import { createChangeCounter } from "../../util/changeCounter";
import Field from "../common/Field.svelte";
import Editor from "./Editor.svelte";

export let classId: ObjectID;
let _class: IClass;

const dispatch = createEventDispatcher();
const countChange = createChangeCounter(dispatch);

const sub = idStore.subscribeManger('class', classId, (model) => {
    _class = model;
    countChange();
}, true, false);
$: sub(classId);

$: deriver = idStore.deriver('class', classId, true);
$: fieldSync = (field: keyof IClass, ...fields: string[]) => idStore.fieldSync('class', classId, [field, ...fields], true);

</script>

<div class="class-editor">
    <div class="row">
        <Field title="Name" type="string" derivation={deriver('name')} grow editable on:change={fieldSync('name')} max={70}/>
        <Field title="Tier" type="number" derivation={deriver('tier')} editable on:change={fieldSync('tier')} min={1} max={3}/>
    </div>
    <div class="row">
        <Field title="Description" type="area" derivation={deriver('description')} rows={5} grow editable max={255} on:change={fieldSync('description')}/>
    </div>
    <Editor type="condition" modelId={_class.prerequisite} box/>
</div>

<style>
    .class-editor {
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
    }
</style>