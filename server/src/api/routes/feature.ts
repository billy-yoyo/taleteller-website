import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createFeature, deleteFeature, getFeatures, searchFeatures, updateFeature } from "../service/feature";

export const featureRouter = express.Router();
featureRouter.use(express.json());

featureRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getFeatures(req, res, (model) => model.scope as DBScope);
});

featureRouter.get("/search", async (req, res) => {
    await searchFeatures(req, res);
});

featureRouter.post("/", async (req, res) => {
    await createFeature(req, res, (model) => model.scope);
});

featureRouter.put("/:id", async (req, res) => {
    await updateFeature(req, res, (model) => model.scope);
});

featureRouter.delete("/:id", async (req, res) => {
    await deleteFeature(req, res, (model) => model.scope);
});
