import T, { ModelType, Template } from "tsplate";
import { TMessage } from "../../api/models/message";
import { IScope } from "../../api/models/scope";
import { createUnion } from "../../util/templateHelper";

export const EventTypes = {
    receiveMessage: T.Object({
        message: TMessage
    }),
    updateMessage: T.Object({
        message: TMessage
    })
} as const;
export type EventType = keyof (typeof EventTypes);

export type IEvent<T extends EventType> = {
    type: T;
    data: ModelType<(typeof EventTypes)[T]>;
    scope: IScope;
};

export const TEvent: Template<IEvent<EventType>, any> = createUnion(EventTypes);
