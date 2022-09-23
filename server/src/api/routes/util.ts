import * as express from "express";
import { userHasWriteAccess } from "../lib/permissions";
import { ScopeMap } from "../models/scope";
import { TScopeQuery } from "../models/util";

export const utilRouter = express.Router();

utilRouter.get("/checkWriteAccess", async (req, res) => {
    if (TScopeQuery.valid(req.query)) {
        const query = TScopeQuery.toModel(req.query);
        const scope = ScopeMap.toModel(query.scope);
        
        const hasAccess = await userHasWriteAccess(req.auth.user, scope);
        res.status(200).json({ hasAccess: hasAccess });
    } else {
        res.status(400).send("Bad query");
    }
});

