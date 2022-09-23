<script lang="ts">
import type { ObjectID } from "../../models/objectId";

import * as chat from "../../store/chat";
import * as idStore from "../../store/idStore";

export let channelId: ObjectID;
let channel;
let campaign;
let unsub: () => void;

chat.channels[channelId].channel.subscribe((model) => {
    channel = model;
    if (unsub) {
        unsub();
    }
    if (model.campaignId !== undefined) {
        unsub = idStore.subscribe('campaign', model.campaignId, (campaignModel) => {
            campaign = campaignModel;
        });
    }
})

</script>

<option value={channelId}>
    {campaign?.name ?? channel.name}
</option>

<style>
    option {
        background-color: #3f3f49;
        border: 1px solid #1f1f29;
        color: #efefef;
    }
</style>