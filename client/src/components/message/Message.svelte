<script lang="ts">
import type { IMessage } from "../../models/message";
import type { ObjectID } from "../../models/objectId";
import type { IUser } from "../../models/user";

import * as chat from "../../store/chat";
import * as idStore from "../../store/idStore";
import MessageSection from "./MessageSection.svelte";

export let messageId: ObjectID;
let message: IMessage;
let author: IUser;
let unsub: () => void;

chat.message(messageId).subscribe((model) => {
    message = model;
    if (unsub) {
        unsub();
    }
    unsub = idStore.subscribe('user', message.author, (authorModel) => {
        author = authorModel;
    });
});

const formatTime = (time: number): string => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minutes}`
}
</script>

<div class="message">
    <div class="header">
        <div class="author">
            {author.name}
        </div>
        <div class="time">
            {formatTime(message.timestamp)}
        </div>
    </div>
    <div class="content" class:card={message.isCard}>
        {#each message.sections as section}
            <MessageSection messageId={messageId} section={section}/>
        {/each}
    </div>
    
</div>

<style>
    .message {
        display: flex;
        flex-direction: column;
    }

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .author {
        color: #cfcfcf;
        vertical-align: middle;
    }

    .time {
        vertical-align: middle;
        font-size: 0.75rem;
        margin-left: 5px;
        margin-top: 2px;
        color: #afafaf;
    }

    .content {
        padding-left: 3px;
        padding-right: 5px;
        padding-top: 5px;
        padding-bottom: 5px;
        display: flex;
        flex-direction: column;
    }

    .card {
        border: 1px solid #5f5f59;
        border-radius: 5px;
        padding: 5px 10px;
        padding-bottom: 10px;
        margin-left: 3px;
        margin-right: 5px;
        margin-top: 5px;
        margin-bottom: 5px;
    }

</style>