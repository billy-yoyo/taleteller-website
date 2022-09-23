import { loadAndStoreMessageModels } from "../controller/message";
import type { IMessage } from "../models/message";
import type { IScope } from "../models/scope";

interface EventTypes {
    receiveMessage: {
        message: IMessage;
    },
    updateMessage: {
        message: IMessage;
    }
}
export type EventType = keyof EventTypes;

export interface Event<T extends EventType> {
    type: T;
    data: EventTypes[T];
    scope: IScope;
}

const eventReceivers: {[key in EventType]: (data: EventTypes[key]) => void } = {
    receiveMessage: (data) => {
        loadAndStoreMessageModels([data.message]);
    },
    updateMessage: (data) => {
        loadAndStoreMessageModels([data.message]);
    }
};

export const receiveEvent = (event: Event<EventType>) => {
    console.log(`received event ${event.type}`);
    eventReceivers[event.type](event.data);
};
