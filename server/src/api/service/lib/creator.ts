import { Document } from "mongoose";
import { Template } from "tsplate";
import * as express from "express";
import { DBScope } from "../../../db/models/scope";
import { userHasWriteAccess } from "../../lib/permissions";

export const modelCreator = <T, M extends Document>(TModel: Template<T, any>, ModelMap: Template<M, T>, callback?: (model: M) => void) => {
    return async (req: express.Request, res: express.Response, getScope: (d: M) => DBScope, preTransform?: (d: T) => Promise<T>, postTransform?: (m: M) => Promise<M>) => {
        try {
            if (TModel.valid(req.body)) {
                let data = TModel.toModel(req.body);
                if (preTransform) {
                    data = await preTransform(data);
                }

                const model = ModelMap.toModel(data);
                
                const scope = getScope(model);
                const hasAccess = await userHasWriteAccess(req.auth.user, scope);
                if (hasAccess) {
                    let result = await model.save();
        
                    if (result) {
                        if (postTransform) {
                            result = await postTransform(result);
                        }

                        if (callback) {
                            callback(result);
                        }

                        console.log(result);

                        res.status(200).json({ model: TModel.toTransit(ModelMap.toTransit(result)) })
                    } else {
                        res.status(500).send("Failed to create");
                    }
                } else {
                    res.status(403).send("Forbidden");
                }
            } else {
                res.status(400).send("Invalid request body");
            }
        } catch (e: any) {
            console.error(e);
            res.status(500).send(`Encountered unexpected server error: ${e.message}`);
        }
    };
}
