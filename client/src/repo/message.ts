import type { IMessage } from "../models/message";
import type { ObjectID } from "../models/objectId";
import { createModel, deleteModel, fetchModels, searchModels, updateModel } from "./lib/modelFetch";
import { saveMethods } from "./model";

export const loadMessages = async (ids: ObjectID[]): Promise<IMessage[]> => {
    return fetchModels('message', ids);
};

export const saveMessage = async (message: Partial<IMessage> & { id: ObjectID }): Promise<void> => {
    return updateModel('message', message.id, message);
};

saveMethods['message'] = saveMessage;

export const createMessage = async (message: IMessage): Promise<IMessage> => {
    return createModel('message', message);
};

export const deleteMessage = async (id: ObjectID): Promise<void> => {
    return deleteModel('message', id);
};
