<script lang="ts">
import type { ObjectID } from "../../models/objectId";

import * as chat from "../../store/chat";
import { selectedChannel } from "../../store/chat";
import ChannelOption from "./ChannelOption.svelte";

let channelIdOrder: ObjectID[];

chat.channelIds.subscribe((channelIds) => {
    channelIdOrder = channelIds;
});

</script>

<select bind:value={$selectedChannel} >
    {#each channelIdOrder as channelId}
        <ChannelOption channelId={channelId}/>
    {/each}
</select>

<style>

select {
    width: 100%;
    background-color: #3f3f49;
    border: 1px solid #1f1f29;
    border-left-style: none;
    color: #efefef;
}
</style>
