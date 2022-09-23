import type { IMessage, IMessageSection, MessageSectionType } from "../models/message";
import type { ModelID } from "../models/model";
import type { ObjectID } from "../models/objectId";
import type { IScope } from "../models/scope";
import { createMessage, loadMessages } from "../repo/message";
import { registerMessages } from "../store/chat";
import * as idStore from "../store/idStore";
import { unique } from "../util/funcHelpers";
import { ensureChannelsInStore } from "./channel";
import { createAndStoreMethods, createBaseDefaultsMethods, ensureMethods, ensureModelsInStore } from "./model";
import { ensureUsersInStore } from "./user";

const messageSectionMapper: {[type in MessageSectionType]: (section: IMessageSection<type>) => ModelID[]} = {
    title: () => [],
    text: () => [],
    roll: (section) => [section.data.roll.roller],
    button: (section) => [section.data.owner]
};

const getMessageSectionModels = <T extends MessageSectionType>(section: IMessageSection<T>): ModelID[] => {
    return messageSectionMapper[section.type](section);
};

export const loadAndStoreMessageModels = async (messages: IMessage[]) => {
    await ensureUsersInStore(messages.map(m => m.author));
    await ensureChannelsInStore(messages.map(m => m.channel));

    const sectionModels = messages.flatMap(message => message.sections.flatMap(getMessageSectionModels));
    await ensureModelsInStore(sectionModels);

    registerMessages(messages);
}

export const loadAndStoreMessages = async (messageIds: ObjectID[]) => {
    const messages = await loadMessages(messageIds);
    await loadAndStoreMessageModels(messages);
};

export const ensureMessagesInStore = async (messageIds: ObjectID[]) => {
    const missingIds = messageIds.filter(id => !idStore.hasModel('message', id));
    if (missingIds.length > 0) {
        await loadAndStoreMessages(unique(missingIds));
    }
};

ensureMethods['message'] = ensureMessagesInStore;

export const createAndStoreMessage = async (message: IMessage) => {
    const createdMessage = await createMessage(message);
    await loadAndStoreMessageModels([createdMessage]);
    return createdMessage;
}

createAndStoreMethods['message'] = createAndStoreMessage;

export const createMessageBaseDefaults = async (message: IMessage, scope?: IScope) => {
    return {};
};

createBaseDefaultsMethods['message'] = createMessageBaseDefaults;
