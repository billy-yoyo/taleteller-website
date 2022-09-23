import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createUpgradeSet, deleteUpgradeSet, getUpgradeSets, searchUpgradeSets, updateUpgradeSet } from "../service/upgradeSet";

export const upgradeSetRouter = express.Router();
upgradeSetRouter.use(express.json());

upgradeSetRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getUpgradeSets(req, res, (model) => model.scope as DBScope);
});

upgradeSetRouter.get("/search", async (req, res) => {
    await searchUpgradeSets(req, res);
});

upgradeSetRouter.post("/", async (req, res) => {
    await createUpgradeSet(req, res, (model) => model.scope);
});

upgradeSetRouter.put("/:id", async (req, res) => {
    await updateUpgradeSet(req, res, (model) => model.scope);
});

upgradeSetRouter.delete("/:id", async (req, res) => {
    await deleteUpgradeSet(req, res, (model) => model.scope);
});
