
import type { RollOptions, RollResult } from "../rolling/roller";
import type { RollReprType } from "../rolling/rollrepr";
import type { ObjectID } from "./objectId";
import type { UnitID } from "./unit";

interface MessageSectionTypes {
    title: {
        content: string
    },
    text: {
        content: string
    },
    roll: {
        roll: RollResult<RollReprType>,
        options: RollOptions
    },
    button: {
        actionId: ObjectID,
        owner: UnitID
    }
}
export type MessageSectionType = keyof MessageSectionTypes;
export type MessageSectionData<T extends MessageSectionType> = MessageSectionTypes[T];

export const isMessageSectionType = <T extends MessageSectionType>(section: IMessageSection<MessageSectionType>, type: T): section is IMessageSection<T> => {
    return section.type === type;
};

export interface IMessageSection<T extends MessageSectionType> {
    id?: string;
    type: T;
    data: MessageSectionData<T>;
}

export interface IMessage {
    id: ObjectID;
    author: ObjectID;
    channel: ObjectID;
    timestamp: number;
    isCard: boolean;
    sections: IMessageSection<MessageSectionType>[];
}

export const createDefaultMessage = (defaults: Partial<IMessage>): IMessage => ({
    id: undefined,
    channel: undefined,
    author: undefined,
    timestamp: new Date().getTime(),
    isCard: false,
    sections: [],
    ...defaults
});

