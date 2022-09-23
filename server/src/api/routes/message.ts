import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createMessage, deleteMessage, getMessages, updateMessage } from "../service/message";

export const messageRouter = express.Router();
messageRouter.use(express.json());

messageRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getMessages(req, res, (model) => ({ type: 'message', link: model.channel }));
});

messageRouter.post("/", async (req, res) => {
    await createMessage(req, res, (model) => ({ type: 'message', link: model.channel }));
});

messageRouter.put("/:id", async (req, res) => {
    await updateMessage(req, res, (model) => ({ type: 'message', link: model.channel }));
});

messageRouter.delete("/:id", async (req, res) => {
    await deleteMessage(req, res, (model) => ({ type: 'message', link: model.channel }));
});
