import type { IChannel } from "../models/channel";
import type { IMessage } from "../models/message";
import type { IModelResponse } from "../models/modelResponse";
import type { ObjectID } from "../models/objectId";
import { createFetch } from "./lib/apiFetch";
import { createModel, deleteModel, fetchModels, updateModel } from "./lib/modelFetch";
import { saveMethods } from "./model";

export const loadMyChannels = async () => {
    const response = await createFetch({
        path: '/api/user/me/channels',
        method: 'GET',
        auth: true
    });
    const models = await response.json() as IModelResponse;
    const channels: IChannel[] = models.model;
    return channels;
};

export const loadChannels = async (ids: ObjectID[]) => {
    return fetchModels('channel', ids);
};

export const saveChannel = async (channel: Partial<IChannel> & { id: ObjectID }): Promise<void> => {
    return updateModel('channel', channel.id, channel);
};

saveMethods['channel'] = saveChannel;

export const createChannel = async (channel: IChannel): Promise<IChannel> => {
    return createModel('channel', channel);
};

export const loadChannelHistory = async (id: ObjectID, from: number, limit: number) => {
    const response = await createFetch({
        path: `/api/channel/${id}/history`,
        method: 'GET',
        auth: true,
        query: {
            from, limit
        }
    });
    const models = await response.json() as IModelResponse;
    const messages: IMessage[] = models.model;
    return messages;
};

export const deleteChannel = async (id: ObjectID): Promise<void> => {
    return deleteModel('channel', id);
};
