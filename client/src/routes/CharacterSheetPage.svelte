<script lang="ts">
import CharacterSheet from "../components/models/CharacterSheet.svelte";
import { ensureCharactersInStore } from "../controller/character";
import type { ObjectID } from "../models/objectId";

export let id: ObjectID;
</script>

{#await ensureCharactersInStore([id])}
    <p>Loading...</p>
{:then}
    <CharacterSheet characterId={id}></CharacterSheet>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
