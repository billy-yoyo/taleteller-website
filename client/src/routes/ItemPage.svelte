<script lang="ts">
import Item from "../components/models/Item.svelte";
import { ensureItemsInStore } from "../controller/item";
import type { ObjectID } from "../models/objectId";

export let id: ObjectID;
export let editing: boolean = false;

</script>

{#await ensureItemsInStore([id])}
    <p>Loading...</p>
{:then}
    <Item itemId={id} editing={editing}/>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
