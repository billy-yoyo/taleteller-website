import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createItem, deleteItem, getItems, searchItems, updateItem } from "../service/item";

export const itemRouter = express.Router();
itemRouter.use(express.json());

itemRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getItems(req, res, (model) => model.scope as DBScope);
});

itemRouter.get("/search", async (req, res) => {
    await searchItems(req, res);
});

itemRouter.post("/", async (req, res) => {
    await createItem(req, res, (model) => model.scope);
});

itemRouter.put("/:id", async (req, res) => {
    await updateItem(req, res, (model) => model.scope);
});

itemRouter.delete("/:id", async (req, res) => {
    await deleteItem(req, res, (model) => model.scope);
});
