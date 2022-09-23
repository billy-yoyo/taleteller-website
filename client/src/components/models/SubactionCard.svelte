<script lang="ts">
import type { IAction } from "../../models/action";
import type { ObjectID } from "../../models/objectId";
import Field from "../common/Field.svelte";
import * as idStore from "../../store/idStore";
import Tag from "../common/Tag.svelte";
import Card from "../cards/Card.svelte";

export let actionId: ObjectID;

let action: IAction;

const sub = idStore.subscribeManger('action', actionId, (model) => {
    action = model;
});
$: sub(actionId);

$: deriver = idStore.deriver('action', actionId);
</script>

<Card card={{ type: 'action', id: actionId, name: action.name, description: action.description, tags: action.tags }}/>