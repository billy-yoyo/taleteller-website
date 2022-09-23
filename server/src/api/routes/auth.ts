import * as express from "express";
import { User } from "../../db/models/user";
import { TLogin, TSignup } from "../models/auth";
import * as bcrypt from "bcrypt";
import { createToken } from "../lib/auth";
import { TUser, UserMap } from "../models/user";

export const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post("/login", async (req: express.Request, res: express.Response) => {
    try {
        if (TLogin.valid(req.body)) {
            const login = TLogin.toModel(req.body);
            const user = await User.findOne({ username: login.username });
            if (user) {
                const valid = await bcrypt.compare(login.password, user.passhash);
                if (valid) {
                    const token = createToken(user);
                    res.status(200).json({ token, user: TUser.toTransit(UserMap.toTransit(user)) });
                } else {
                    res.status(403).send("Forbidden");
                }
            } else {
                res.status(403).send("Forbidden");
            }
        } else {
            res.status(400).send("Invalid body");
        }
    } catch (e: any) {
        console.error(e);
        res.status(500).send(`Something went wrong: ${e.message}`)
    }
});

authRouter.post("/signup", async (req: express.Request, res: express.Response) => {
    try {
        if (TSignup.valid(req.body)) {
            const signup = TSignup.toModel(req.body);
            const user = await User.findOne({ username: signup.username });
            if (user) {
                res.status(403).send("Forbidden");
            } else {
                const salt = await bcrypt.genSalt(10);
                const passhash = await bcrypt.hash(signup.password, salt);

                const user = new User({
                    username: signup.username,
                    name: signup.name,
                    admin: true,
                    passhash
                });

                const saved = await user.save();

                res.status(200).json({ user: TUser.toTransit(UserMap.toTransit(saved)) });
            }
        } else {
            res.status(400).send("Invalid body");
        }
    } catch (e: any) {
        res.status(500).send(`Something went wrong: ${e.message}`)
    }
});
