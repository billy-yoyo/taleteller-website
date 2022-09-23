<script lang="ts">
import { get } from "svelte/store";

import { loadNextChatPage, sendAndStoreMessage } from "../../controller/chat";
import type { ObjectID } from "../../models/objectId";
import * as chat from "../../store/chat";
import ChannelChooser from "./ChannelChooser.svelte";
import Message from "./Message.svelte";

let selectedChannel: ObjectID;
let messages: chat.MessageTime[];
let visible: boolean = true;
let text: string;
let finishedHistory: boolean = false;

let unsubMessages: () => void;
let unsubFinished: () => void;

chat.selectedChannel.subscribe(channelId => {
    selectedChannel = channelId;
    if (unsubMessages) {
        unsubMessages();
    }
    if (unsubFinished) {
        unsubFinished();
    }
    if (channelId !== undefined) {
        unsubMessages = chat.messageTimes(channelId).subscribe(model => {
            messages = model;
        });
        unsubFinished = chat.finishedHistory(channelId).subscribe(model => {
            finishedHistory = model;
        });
    } else {
        unsubMessages = undefined;
        unsubFinished = undefined;
    }

    if (channelId && get(chat.channels[channelId].messageTimes).length === 0) {
        loadNextChatPage(channelId, 20);
    }
});

const toggleVisibility = () => {
    visible = !visible;
};

const onSubmit = () => {
    if (selectedChannel) {
        sendAndStoreMessage(selectedChannel, [{ type: 'text', data: { content: text } }], false);
        text = '';
    }
};

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        onSubmit();
    }
};

const LOAD_THRESHOLD = 100;
const LOAD_COOLDOWN = 200;
let lastLoad: number = 0;

const onScroll = (e: UIEvent) => {
    if (selectedChannel && !finishedHistory && new Date().getTime() - lastLoad > LOAD_COOLDOWN) {
        const target = e.target as HTMLElement;
        const offset = target.scrollTop + target.scrollHeight - target.clientHeight;
        if (offset <= LOAD_THRESHOLD) {
            lastLoad = new Date().getTime();
            loadNextChatPage(selectedChannel);
        }
    }
};

</script>

<div class="chat-container">
    <div class="toggle-bar">
        <button class="toggle" on:click={toggleVisibility}>
            {visible ? 'Hide Chat' : 'Show Chat'}
        </button>
        <div class="filler"></div>
    </div>
    {#if visible}
        <div class="chat">
            <div class="header">
                <ChannelChooser />
            </div>
            <div class="messages" on:scroll={onScroll}>
                {#if messages !== undefined}
                    {#each messages as messageTime (messageTime[0])}
                        <Message messageId={messageTime[0]}/>
                    {/each}
                {/if}
            </div>
            <div class="footer">
                {#if selectedChannel !== undefined}
                    <div class="textbox">
                        <input type="text" bind:value={text} on:keydown={onKeyDown}>
                    </div>
                    <button class="submit" on:click={onSubmit}>Send</button>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
.chat-container {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 400px;
    top: 150px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
}

.toggle-bar {
    width: 100%;
    display: flex;
    flex-direction: row;
}

.toggle {
    margin-bottom: 0;
    background-color: #3f3f49;
    border: 2px solid #03030f;
    border-bottom-style: none;
    color: #efefef;
}

.chat {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: #2f2f39;
    border: 2px solid #03030f;
    border-right-style: none;
    border-top-style: none;
    border-bottom-style: none;
}

.filler {
    flex: 1;
    border-bottom: 2px solid #03030f;
}

.header {
    width: 100%;
}

.messages {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column-reverse;
    padding: 10px;
    overflow-y: scroll;
}

.footer {
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
}

.textbox {
    flex: 1;
}

.submit {
    margin-left: 2px;
    background-color: #3f3f49;
    border: 1px solid #1f1f29;
    color: #efefef;
}

.submit:active {
    background-color: #44444f;
}

input {
    width: 100%;
    background-color: #3f3f49;
    border: 1px solid #1f1f29;
    color: #efefef;
}
</style>
