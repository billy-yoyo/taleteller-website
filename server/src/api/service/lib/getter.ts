import * as express from "express";
import { ObjectId } from "mongodb";
import { DBScope } from "../../../db/models/scope";
import { userHasReadAccessToAll } from "../../lib/permissions";
import { TIdArray } from "../../models/helpers/idArray";
import { ModelResponse } from "./modelResponseBuilder";

export const modelGetter = (getModelResponse: (ids: ObjectId[]) => Promise<ModelResponse[]>) => {
    return async (req: express.Request, res: express.Response, getScope: (model: any) => DBScope) => {
        try {
            if (TIdArray.valid(req.query.ids)) {
                const ids = TIdArray.toModel(req.query.ids);
                const responses = await getModelResponse(ids);
                
                const hasAccess = await userHasReadAccessToAll(req.auth.user, responses.map(resp => getScope(resp.model)))

                // 404 to stop id guessing
                if (responses.length === 0 || !hasAccess) {
                    res.status(404).send('Failed to find any of those ids');
                } else {
                    res.status(200).json(ModelResponse.merge(responses).build());
                }
            } else {
                res.status(400).send(`Invalid ids parameter`);
            }
        } catch (e: any) {
            console.error(e);
            res.status(500).send(`Encountered unexpected server error: ${e.message}`);
        }
    };  
};
