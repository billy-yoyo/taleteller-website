import { Document, Model } from "mongoose";
import { DBScope } from "../../../db/models/scope";
import * as express from "express";
import { TObjectId } from "../../models/helpers/objectId";
import { userHasWriteAccess } from "../../lib/permissions";

export const modelDeleter = <M>(DBModel: Model<M & Document>) => {
    return async (req: express.Request, res: express.Response, getScope: (m: M & Document) => DBScope) => {
        try { 
            if (req.params.id && TObjectId.valid(req.params.id)) {
                const id = TObjectId.toModel(req.params.id);
                const model = await DBModel.findById(id);

                if (model) {
                    const scope = getScope(model);

                    const hasAccess = await userHasWriteAccess(req.auth.user, scope);
                    if (hasAccess) {
                        await model.delete();

                        res.status(200).send(`OK`);
                    } else {
                        res.status(403).send(`Forbidden`);
                    }
                } else {
                    res.status(403).send(`Forbidden`);
                }
            } else {
                res.status(400).send(`Invalid id parameter`);
            }
        } catch (e: any) {
            res.status(500).send(`Encountered unexpected server error: ${e.message}`)
        }
    };
}