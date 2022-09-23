import { get, writable, Writable } from "svelte/store";
import type { IChannel } from "../models/channel";
import type { IMessage, IMessageSection, MessageSectionType } from "../models/message";
import type { ObjectID } from "../models/objectId";
import { groupBy, insertIntoSorted } from "../util/funcHelpers";

export type MessageTime = [id: ObjectID, timestamp: number];


export interface ChannelStore {
    channel: Writable<IChannel>;
    messageTimes: Writable<MessageTime[]>;
    finishedHistory: Writable<boolean>;
}

export const channelIds: Writable<ObjectID[]> = writable([]);
export const channels: {[id: ObjectID]: ChannelStore} = {};
export const messageIdMap: {[id: ObjectID]: Writable<IMessage>} = {};
export const selectedChannel: Writable<ObjectID> = writable();

export const hasChannel = (channelId: ObjectID) => {
    if (channels[channelId]) {
        return true;
    } else {
        return false;
    }
};

export const registerChannel = (channel: IChannel) => {
    if (!channels[channel.id]) {
        channels[channel.id] = {
            channel: writable(channel),
            messageTimes: writable([]),
            finishedHistory: writable(false)
        };
        channelIds.update((model) => [...model, channel.id]);

        if (get(selectedChannel) === undefined) {
            selectedChannel.set(channel.id);
        }
    }
};

export const assertChannelExists = (channelId: ObjectID) => {
    if (hasChannel(channelId)) {
        return;
    } else {
        throw new Error(`Attempted to exist a channel which doesn't exist: ${channelId}`);
    }
}

export const addMessageToIdMap = (message: IMessage) => {
    const storedModel = messageIdMap[message.id];
    if (storedModel) {
        storedModel.set(message);
    } else {
        messageIdMap[message.id] = writable(message);
    }
};

export const updateMessageToIdMap = (messageId: ObjectID, sections: IMessageSection<MessageSectionType>[]) => {
    const storedModel = messageIdMap[messageId];
    if (storedModel) {
        storedModel.update((message) => {
            return {
                ...message,
                sections: message.sections.map(section => {
                    const newSection = sections.find(s => s.id === section.id);
                    return newSection ?? section;
                })
            };
        })
    } else {
        throw Error(`Attempted to update a message which doesn't exist in the chat store: ${messageId}`);
    }
};

const registerMessagesForChannel = (channelId: ObjectID, messages: IMessage[]) => {
    assertChannelExists(channelId);

    messages.forEach(message => {
        addMessageToIdMap(message);
    });

    const store = channels[channelId];
    store.messageTimes.update((messageTimes) => {
        const newMessageTimes: MessageTime[] = messageTimes.slice();

        messages.forEach(message => {
            let messageTime: MessageTime = newMessageTimes.find(mt => mt[0] === message.id);
            if (messageTime) {
                messageTime[1] = message.timestamp;
            } else {
                messageTime = [message.id, message.timestamp];
                insertIntoSorted(newMessageTimes, messageTime, (a, b) =>  b[1] - a[1]);
            }
        });

        return newMessageTimes;
    });
};

export const registerMessages = (messages: IMessage[]) => {
    const messagesByChannel = groupBy(messages, m => m.channel);
    Object.entries(messagesByChannel).forEach(([channelId, subMessages]) => registerMessagesForChannel(channelId, subMessages));
}

export const messageTimes = (channelId: ObjectID) => {
    assertChannelExists(channelId);
    return channels[channelId].messageTimes;
};

export const message = (messageId: ObjectID) => {
    const store = messageIdMap[messageId];
    if (store) {
        return store;
    } else {
        throw new Error(`Attempted to access a message which doesn't exist: ${messageId} `)
    }
};

export const finishedHistory = (channelId: ObjectID) => {
    assertChannelExists(channelId);
    return channels[channelId].finishedHistory;
};
