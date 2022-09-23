<script lang="ts">
import Campaign from "../components/models/Campaign.svelte";

import { ensureCampaignsInStore } from "../controller/campaign";

import type { ObjectID } from "../models/objectId";



export let id: ObjectID;
</script>

{#await ensureCampaignsInStore([id])}
    Loading...
{:then} 
    <Campaign campaignId={id}/>
{:catch error}
    <p color="red">Failed to load: <br> {error}</p>
{/await}
