import * as express from "express";
import { ObjectId } from "mongodb";
import { TModelResponse } from "../models/modelResponse";
import { IUser, TUser, UserMap } from "../models/user";
import { getChannelsForUser } from "../service/channel";
import { ModelResponse } from "../service/lib/modelResponseBuilder";
import { deleteUser, getUsers, updateUser } from "../service/user";

export const userRouter = express.Router();
userRouter.use(express.json());

userRouter.get("/", async (req: express.Request<{ ids: string }>, res) => {
    await getUsers(req, res, (model) => ({ type: 'user', link: new ObjectId(model.id) }));
});

userRouter.get("/me", async (req, res) => {
    const response = new ModelResponse('user', TUser.toTransit(UserMap.toTransit(req.auth.user)));
    res.status(200).json(TModelResponse.toTransit(response));
});

userRouter.put("/:id", async (req, res) => {
    await updateUser(req, res, (model) => ({ type: 'user', link: model._id }));
});

userRouter.get("/me/channels", async (req, res) => {
    const channels = await getChannelsForUser(new ObjectId(req.auth.user._id));
    res.status(200).json(channels);
});

userRouter.delete("/:id", async (req, res) => {
    await deleteUser(req, res, (model) => ({ type: 'user', link: model._id }));
});
