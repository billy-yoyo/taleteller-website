<script lang="ts">
import Class from "../components/models/Class.svelte";
import { ensureClassesInStore } from "../controller/class";
import type { ObjectID } from "../models/objectId";

export let id: ObjectID;
export let editing: boolean = false;

</script>

{#await ensureClassesInStore([id])}
    <p>Loading...</p>
{:then}
    <Class classId={id} editing={editing}/>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
