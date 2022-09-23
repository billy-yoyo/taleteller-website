import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createUpgrade, deleteUpgrade, getUpgrades, updateUpgrade } from "../service/upgrade";

export const upgradeRouter = express.Router();
upgradeRouter.use(express.json());

upgradeRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getUpgrades(req, res, (model) => model.scope as DBScope);
});

upgradeRouter.post("/", async (req, res) => {
    await createUpgrade(req, res, (model) => model.scope);
});

upgradeRouter.put("/:id", async (req, res) => {
    await updateUpgrade(req, res, (model) => model.scope);
});

upgradeRouter.delete("/:id", async (req, res) => {
    await deleteUpgrade(req, res, (model) => model.scope);
});
