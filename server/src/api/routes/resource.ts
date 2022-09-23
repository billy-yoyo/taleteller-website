import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createResource, deleteResource, getResources, updateResource } from "../service/resource";

export const resourceRouter = express.Router();
resourceRouter.use(express.json());

resourceRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getResources(req, res, (model) => model.scope as DBScope);
});

resourceRouter.post("/", async (req, res) => {
    await createResource(req, res, (model) => model.scope);
});

resourceRouter.put("/:id", async (req, res) => {
    await updateResource(req, res, (model) => model.scope);
});

resourceRouter.delete("/:id", async (req, res) => {
    await deleteResource(req, res, (model) => model.scope);
});
