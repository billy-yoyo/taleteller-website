<script lang="ts">
import Charactermancer from "../components/charactermancer/Charactermancer.svelte";
import { ensureCharactersInStore } from "../controller/character";

import type { ObjectID } from "../models/objectId";

export let id: ObjectID;

</script>

{#await ensureCharactersInStore([id])}
    <p>Loading...</p>
{:then}
    <Charactermancer characterId={id}></Charactermancer>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
