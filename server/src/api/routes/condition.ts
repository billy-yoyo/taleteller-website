import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createCondition, deleteCondition, getConditions, updateCondition } from "../service/condition";

export const conditionRouter = express.Router();
conditionRouter.use(express.json());

conditionRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getConditions(req, res, (model) => model.scope as DBScope);
});

conditionRouter.post("/", async (req, res) => {
    await createCondition(req, res, (model) => model.scope);
});

conditionRouter.put("/:id", async (req, res) => {
    await updateCondition(req, res, (model) => model.scope);
});

conditionRouter.delete("/:id", async (req, res) => {
    await deleteCondition(req, res, (model) => model.scope);
});
