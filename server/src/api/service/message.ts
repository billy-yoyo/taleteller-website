import { ObjectId } from "mongodb";
import { Message, DBMessage } from "../../db/models/message";
import { mapMessageUpdate, MessageMap, TMessage, TPartialMessage } from "../models/message";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { onMessageCreate, onMessageUpdate } from "../../event/sender/messages";
import { modelDeleter } from "./lib/deleter";

export const getMessageModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('message', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const messages = await Message.find({ _id: { $in: filteredIds } });
        return await Promise.all(messages.map(message => getMessageModelResponse(message, parent)));
    } else {
        return [];
    }
};

export const getMessageModelResponse = async (message: DBMessage, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('message', TMessage.toTransit(MessageMap.toTransit(message)), parent);
    return response;
};

export const loadMessageHistory = async (channelId: ObjectId, from: number, limit: number): Promise<ModelResponse> => {
    const messages = await Message.find({
        channel: channelId,
        timestamp: { $lt: from },
    }).sort({ timestamp: "desc" }).limit(limit);

    const responses = await Promise.all(messages.map((message: DBMessage) => getMessageModelResponse(message)));
    return ModelResponse.merge(responses);
}

export const getMessages = modelGetter(getMessageModelResponseByIds);
export const createMessage = modelCreator(TMessage, MessageMap, onMessageCreate);
export const updateMessage = modelUpdater(TPartialMessage, Message, mapMessageUpdate, onMessageUpdate);
export const deleteMessage = modelDeleter(Message);
