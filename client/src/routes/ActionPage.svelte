<script lang="ts">
import Action from "../components/models/Action.svelte";
import { ensureActionsInStore } from "../controller/action";
import type { ObjectID } from "../models/objectId";

export let id: ObjectID;
export let editing: boolean = false;

</script>

{#await ensureActionsInStore([id])}
    Loading...
{:then} 
    <Action actionId={id} editing={editing} editEnabled/>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
