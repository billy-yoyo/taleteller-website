import * as express from "express";
import { DBScope } from "../../db/models/scope";
import { createClass, deleteClass, getClasses, searchClasses, updateClass } from "../service/class";

export const classRouter = express.Router();
classRouter.use(express.json());

classRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getClasses(req, res, (model) => model.scope as DBScope);
});

classRouter.get("/search", async (req, res) => {
    await searchClasses(req, res);
});

classRouter.post("/", async (req, res) => {
    await createClass(req, res, (model) => model.scope);
});

classRouter.put("/:id", async (req, res) => {
    await updateClass(req, res, (model) => model.scope);
});

classRouter.delete("/:id", async (req, res) => {
    await deleteClass(req, res, (model) => model.scope);
});
