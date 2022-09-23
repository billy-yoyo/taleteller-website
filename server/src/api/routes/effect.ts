import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createEffect, deleteEffect, getEffects, updateEffect } from "../service/effect";

export const effectRouter = express.Router();
effectRouter.use(express.json());

effectRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getEffects(req, res, (model) => model.scope as DBScope);
});

effectRouter.post("/", async (req, res) => {
    await createEffect(req, res, (model) => model.scope);
});

effectRouter.put("/:id", async (req, res) => {
    await updateEffect(req, res, (model) => model.scope);
});

effectRouter.delete("/:id", async (req, res) => {
    await deleteEffect(req, res, (model) => model.scope);
});
