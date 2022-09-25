import * as express from "express";
import { authHeader, fetchAuthUser, initAuth } from "./api/lib/auth";
import { actionRouter } from "./api/routes/action";
import { authRouter } from "./api/routes/auth";
import { campaignRouter } from "./api/routes/campaign";
import { characterRouter } from "./api/routes/character";
import { classRouter } from "./api/routes/class";
import { conditionRouter } from "./api/routes/condition";
import { effectRouter } from "./api/routes/effect";
import { featureRouter } from "./api/routes/feature";
import { itemRouter } from "./api/routes/item";
import { resourceRouter } from "./api/routes/resource";
import { upgradeRouter } from "./api/routes/upgrade";
import { upgradeSetRouter } from "./api/routes/upgradeSet";
import { userRouter } from "./api/routes/user";
import { connectToDatabase } from "./db/database";
import * as path from "path";
import { utilRouter } from "./api/routes/util";
import { actionModRouter } from "./api/routes/actionMod";
import { decodeQuery } from "./api/lib/queryHelper";
import { channelRouter } from "./api/routes/channel";
import { messageRouter } from "./api/routes/message";
import * as useWebsocket from "express-ws";
import { waitForSocketRegistration } from "./event/targets";
import * as dotenv from "dotenv";
import * as https from "https";
import * as fs from "fs";

dotenv.config();

const app = express();
useWebsocket(app);

const port = process.env.PORT; // default port to listen
const host = process.env.HOST;

const ssl = process.env.SSL === 'true';

const createServer = () => {
    if (ssl) {
        const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY as string);
        const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE as string);
        return https.createServer({ key: privateKey, cert: certificate }, app);
    } else {
        return app;
    }
};

const PUBLIC_URI = "../client/public";

const startServer = async () => {
    try {
        await connectToDatabase();
        await initAuth();

        app.use("/auth", authRouter);

        const api = express.Router();
        app.use("/api", api);

        api.use(authHeader());
        api.use(fetchAuthUser);
        api.use(decodeQuery);
        
        api.use(function (err: any, req: any, res: any, next: any) {
            // render the error page
            console.error(err);
            next(err);
        });

        api.use("/action", actionRouter);
        api.use("/actionMod", actionModRouter);
        api.use("/campaign", campaignRouter);
        api.use("/character", characterRouter);
        api.use("/class", classRouter);
        api.use("/condition", conditionRouter);
        api.use("/effect", effectRouter);
        api.use("/feature", featureRouter);
        api.use("/item", itemRouter);
        api.use("/resource", resourceRouter);
        api.use("/upgrade", upgradeRouter);
        api.use("/upgradeSet", upgradeSetRouter);
        api.use("/user", userRouter);
        api.use("/util", utilRouter);
        api.use("/channel", channelRouter);
        api.use("/message", messageRouter);

        const wsRouter = express.Router();
        app.use("/ws", wsRouter);

        wsRouter.ws("/connect", (ws) => {
            waitForSocketRegistration(ws);
        });

        app.use("/", express.static(PUBLIC_URI));
        app.use("/*", (req, res) => { console.log(req.path); res.sendFile(path.resolve(`${PUBLIC_URI}/index.html`)) });

        createServer().listen(port, () => {
            console.log(`server started at http${ssl ? 's' : ''}://${host}:${port}`);
        });

    } catch(e) {
        console.error(`Failed to start the server`, e);
        process.exit();
    }
};

startServer();
