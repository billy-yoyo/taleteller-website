import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createActionMod, deleteActionMod, getActionMods, searchActionMods, updateActionMod } from "../service/actionMod";

export const actionModRouter = express.Router();
actionModRouter.use(express.json());

actionModRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getActionMods(req, res, (model) => model.scope as DBScope);
});

actionModRouter.get("/search", async (req: express.Request, res: express.Response) => {
    await searchActionMods(req, res);
});

actionModRouter.post("/", async (req, res) => {
    await createActionMod(req, res, (model) => model.scope);
});

actionModRouter.put("/:id", async (req, res) => {
    await updateActionMod(req, res, (model) => model.scope);
});

actionModRouter.delete("/:id", async (req, res) => {
    await deleteActionMod(req, res, (model) => model.scope);
});

