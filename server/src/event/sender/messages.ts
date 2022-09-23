import { MessageMap } from "../../api/models/message";
import { DBMessage } from "../../db/models/message";
import { sendEvent } from "../handler";

export const onMessageCreate = async (message: DBMessage) => {
    await sendEvent({
        type: 'receiveMessage',
        scope: {
            type: 'message',
            link: message.channel
        },
        data: {
            message: MessageMap.toTransit(message)
        }
    });
};  

export const onMessageUpdate = async (message: DBMessage) => {
    await sendEvent({
        type: 'updateMessage',
        scope: {
            type: 'message',
            link: message.channel
        },
        data: {
            message: MessageMap.toTransit(message)
        }
    });
};
