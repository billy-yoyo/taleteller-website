import * as express from "express";
import { createCharacter, deleteCharacter, getCharacters, searchCharacters, updateCharacter } from "../service/character";

export const characterRouter = express.Router();
characterRouter.use(express.json());

characterRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getCharacters(req, res, (model) => ({ type: 'character', link: model.id }));
});

characterRouter.get("/search", async (req, res) => {
    await searchCharacters(req, res);
});

characterRouter.post("/", async (req, res) => {
    await createCharacter(req, res, (model) => ({ type: 'character', link: model._id }));
});

characterRouter.put("/:id", async (req, res) => {
    await updateCharacter(req, res, (model) => ({ type: 'character', link: model._id }));
});

characterRouter.delete("/:id", async (req, res) => {
    await deleteCharacter(req, res, (model) => ({ type: 'character', link: model._id }));
});

