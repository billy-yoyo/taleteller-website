<script lang="ts">
import UpgradeSet from "../components/models/UpgradeSet.svelte";
import { ensureUpgradeSetsInStore } from "../controller/upgradeSet";
import type { ObjectID } from "../models/objectId";

export let id: ObjectID;
export let editing: boolean = false;

</script>

{#await ensureUpgradeSetsInStore([id])}
    Loading...
{:then}
    <UpgradeSet upgradeSetId={id} editing={editing} editEnabled/>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
