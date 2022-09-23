import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createAction, deleteAction, getActions, searchActions, updateAction } from "../service/action";

export const actionRouter = express.Router();
actionRouter.use(express.json());

actionRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getActions(req, res, (model) => model.scope as DBScope);
});

actionRouter.get("/search", async (req: express.Request, res: express.Response) => {
    await searchActions(req, res);
});

actionRouter.post("/", async (req, res) => {
    await createAction(req, res, (model) => model.scope);
});

actionRouter.put("/:id", async (req, res) => {
    await updateAction(req, res, (model) => model.scope);
});

actionRouter.delete("/:id", async (req, res) => {
    await deleteAction(req, res, (model) => model.scope);
});
