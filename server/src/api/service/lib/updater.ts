import { Document, Model } from "mongoose";
import { DeepPartial, Template } from "tsplate";
import * as express from "express";
import { TObjectId } from "../../models/helpers/objectId";
import { isPlainObject } from "../../../util/funcHelper";
import { DBScope } from "../../../db/models/scope";
import { userHasWriteAccess } from "../../lib/permissions";

const deepApplyObject = (model: any, update: any) => {
    Object.entries(update).map(([k, v]) => {
        if (model[k] && isPlainObject(v)) {
            deepApplyObject(model[k], v);
        } else if (v !== undefined) {
            model[k] = v;
        }
    });
};

export const modelUpdater = <T, M>(
    TPartialModel: Template<DeepPartial<T>, any>,
    DBModel: Model<M & Document>,
    mapUpdate: (data: DeepPartial<T> | undefined) => DeepPartial<M> | undefined,
    callback?: (model: M & Document) => void
) => {
    return async (req: express.Request, res: express.Response, getScope: (m: M & Document) => DBScope) => {
        try { 
            if (req.params.id && TObjectId.valid(req.params.id)) {
                const id = TObjectId.toModel(req.params.id);
                if (TPartialModel.valid(req.body)) {
                    const model = await DBModel.findById(id);
                    if (model) {
                        const scope = getScope(model);
                        const hasAccess = await userHasWriteAccess(req.auth.user, scope);

                        if (hasAccess) {
                            const data = TPartialModel.toModel(req.body);
                            const update = mapUpdate(data);
                            
                            const updatedModel = await DBModel.findByIdAndUpdate(id, update);

                            if (callback && updatedModel) {
                                callback(updatedModel);
                            }

                            res.status(200).send('Updated');
                        } else {
                            res.status(404).send(`Failed to find model with id ${id.toHexString()}`);
                        }
                    } else {
                        res.status(404).send(`Failed to find model with id ${id.toHexString()}`);
                    }
                } else {
                    res.status(400).send(`Invalid request body`);
                }
            } else {
                res.status(400).send(`Invalid id parameter`);
            }
        } catch (e: any) {
            res.status(500).send(`Encountered unexpected server error: ${e.message}`)
        }
    };
};
