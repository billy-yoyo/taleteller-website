import type { IMessageSection, MessageSectionType } from "../models/message";
import * as chat from "../store/chat";
import * as me from "../store/me";
import { saveMessage } from "../repo/message";
import type { ObjectID } from "../models/objectId";
import { createAndStoreMessage } from "./message";
import { get } from "svelte/store";
import { loadAndStoreChannelHistory } from "./channel";

const CHAT_HISTORY_PAGE_SIZE = 10;

export const sendAndStoreMessage = async (channelId: ObjectID, sections: IMessageSection<MessageSectionType>[], isCard: boolean) => {
    const user = get(me.user);
    await createAndStoreMessage({
        id: undefined,
        author: user.id,
        channel: channelId,
        timestamp: new Date().getTime(),
        isCard,
        sections
    });
};

export const updateAndStoreMessage = async (messageId: ObjectID, sections: IMessageSection<MessageSectionType>[]) => {
    const message = get(chat.messageIdMap[messageId]);
    if (message) {
        const mappedSections = message.sections.map(section => {
            const updatedSection = sections.find(otherSection => section.id === otherSection.id);
            return updatedSection ?? section;
        });
        await saveMessage({ id: messageId, sections });
    } else {
        await saveMessage({ id: messageId, sections });
    }
    chat.updateMessageToIdMap(messageId, sections);
};

export const loadNextChatPage = async (channelId: ObjectID, pageSize: number = CHAT_HISTORY_PAGE_SIZE) => {
    if (chat.hasChannel(channelId) && !get(chat.channels[channelId].finishedHistory)) {
        const messages = get(chat.messageTimes(channelId));
        const oldestTimestamp = messages.length === 0 ? new Date().getTime() : messages[messages.length - 1][1];
        const history = await loadAndStoreChannelHistory(channelId, oldestTimestamp, pageSize);
        if (history.length < pageSize) {
            chat.channels[channelId].finishedHistory.set(true);
        }
    }
     
};
