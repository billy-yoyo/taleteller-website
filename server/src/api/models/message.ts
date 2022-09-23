import { createNonScopedUnion, createUnion } from "../../util/templateHelper";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { TObjectId } from "./helpers/objectId";
import { DBMessage, DBMessageProps, Message } from "../../db/models/message";
import { ObjectId } from "mongodb";
import { TEffectRollCategory } from "./effect";
import { TSource } from "./source";

const TMessageSectionMap = {
    title: T.Object({
        content: T.String
    }),
    text: T.Object({
        content: T.String
    }),
    roll: T.Object({
        roll: T.Any,
        options: T.Any
    }),
    button: T.Object({
        actionId: TObjectId,
        owner: TSource
    })
} as const;
export type MessageSectionType = keyof typeof TMessageSectionMap
export type IMessageSection<T extends MessageSectionType> = {
    id: string;
    type: T;
    data: ModelType<(typeof TMessageSectionMap)[T]>;
};
export const TMessageSection: Template<IMessageSection<MessageSectionType>, any> = createNonScopedUnion(TMessageSectionMap) as any;

export const TMessage = T.Object({
    id: T.Optional(TObjectId),
    author: TObjectId,
    channel: TObjectId,
    timestamp: T.Int,
    isCard: T.Boolean,
    sections: T.Array(TMessageSection)
});
export const TPartialMessage = T.toPartial(TMessage);
export type IMessage = ModelType<typeof TMessage>;


const mapToApi = (message: DBMessage): IMessage => {
    return {
        id: message._id,
        author: message.author,
        channel: message.channel,
        timestamp: message.timestamp,
        isCard: message.isCard,
        sections: message.sections.map(section => ({
            id: section.id,
            type: section.type,
            data: section.data
        }))
    }
};

const mapToDb = (message: IMessage): DBMessage => {
    return new Message({
        _id: message.id,
        author: message.author,
        channel: message.channel,
        timestamp: message.timestamp,
        isCard: message.isCard,
        sections: message.sections.map(section => ({
            id: section.id,
            type: section.type,
            data: section.data
        }))
    });
}

export const MessageMap: Template<DBMessage, IMessage> = {
    valid: (t: any): t is IMessage => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapMessageUpdate = (message: DeepPartial<IMessage> | undefined): DeepPartial<DBMessageProps> | undefined => {
    return message === undefined ? undefined : {
        author: message.author,
        channel: message.channel,
        timestamp: message.timestamp,
        isCard: message.isCard,
        sections: message.sections
    };
};
