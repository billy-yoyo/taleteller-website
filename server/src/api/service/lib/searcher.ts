import { FilterQuery, Model, Document, HydratedDocument } from "mongoose";
import { Template } from "tsplate";
import { ModelType } from "../../../db/models/source";
import * as express from "express";
import { createPaginationOptions, createScopeFilters, TPagination } from "../../models/pagination";
import { CardFields, createCard, TCardsResponse } from "../../models/card";
import { userHasReadAccessToAll } from "../../lib/permissions";
import { ScopeMap } from "../../models/scope";

export const modelSearcher = <M, FM, FT>(
    TFilterTemplate: Template<FM, FT>,
    getFilters: (filters: FM) => FilterQuery<M>,
    DBModel: Model<M>,
    type: ModelType,
    customFields?: string,
    getCustomTags?: (model: HydratedDocument<M, {}, {}>) => string[],
    customFilter?: (filters: FM, model: HydratedDocument<M, {}, {}>) => Promise<boolean>
) => {
    return async (req: express.Request, res: express.Response) => {
        if (TFilterTemplate.valid(req.query) && TPagination.valid(req.query)) {
            const filters = TFilterTemplate.toModel(req.query);
            const pagination = TPagination.toModel(req.query);
    
            const hasAccess = await userHasReadAccessToAll(req.auth.user, pagination.scopes.map(ScopeMap.toModel));

            if (hasAccess) {
                const modelFilters = getFilters(filters);
                const scopeFilters = await createScopeFilters(type, pagination);

                console.log(scopeFilters);

                if (scopeFilters === undefined) {
                    res.status(403).send("Invalid scope filters");
                } else {
                    const fields = CardFields + (customFields !== undefined ? ` ${customFields}` : '');
                    const results = await DBModel.find(
                        { ...modelFilters, ...scopeFilters },
                        fields,
                        createPaginationOptions(pagination, customFilter === undefined)
                    );

                    let filteredResults = customFilter !== undefined ? [] : results;

                    if (customFilter !== undefined) {
                        let i = 0;
                        while (filteredResults.length < ((pagination.page + 1) * pagination.limit) && i < results.length) {
                            const include = await customFilter(filters, results[i]);
                            if (include) {
                                filteredResults.push(results[i]);
                            }
                            i++;
                        }

                        filteredResults = filteredResults.slice(-pagination.limit);
                    }

                    const cards = filteredResults.map(result => {
                        const card = createCard(type, result);
                        if (getCustomTags) {
                            const tags = getCustomTags(result);
                            if (!card.tags) {
                                card.tags = tags;
                            } else {
                                card.tags = [...card.tags, ...tags];
                            }
                        }
                        return card;
                    });

                    res.status(200).json(TCardsResponse.toTransit({ cards }));
                }
            } else {
                res.status(403).send("Forbidden");
            }
        } else {
            res.status(400).send("Invalid filters");
        }
    };
};
