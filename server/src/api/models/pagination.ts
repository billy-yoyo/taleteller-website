import { FilterQuery, QueryOptions } from "mongoose";
import T, { ModelType } from "tsplate";
import { TIntString } from "./helpers/numberString";
import { TStringArray } from "./helpers/stringArray";
import { IScope, TStringScope } from "./scope";
import { ModelType as MT } from "../../db/models/source";
import { Campaign } from "../../db/models/campaign";

export const TPagination = T.Object({
    page: TIntString,
    limit: TIntString,
    sort: T.Optional(T.String),
    scopes: TStringArray(",", TStringScope)
});
export type IPagination = ModelType<typeof TPagination>;

export const createPaginationOptions = (pagination: IPagination, hasLimit: boolean = true): QueryOptions => {
    return {
        skip: pagination.page * pagination.limit,
        limit: hasLimit ? pagination.limit : undefined,
        sort: pagination.sort ?? '-name'
    };
};

const createScopeFilter = async (type: MT, scope: IScope): Promise<FilterQuery<any> | undefined> => {
    // specific use case for finding a user's characters
    if (type === "character") {
        if (scope.type === "user") {
            return {
                owner: scope.link
            };
        } else if (scope.type === "campaign") {
            const campaign = await Campaign.findById(scope.link, "characters");
            if (campaign) {
                const characterIds = campaign?.characters;
                return {
                    _id: { $in: characterIds }
                };
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    } else if (type === "campaign") {
        if (scope.type === "user") {
            return {
                users: scope.link
            };
        } else {
            return undefined;
        }
    } else if (scope.link === undefined) {
        return {
            "scope.type": scope.type
        };
    } else {
        return {
            "scope.type": scope.type,
            "scope.link": scope.link
        };
    }
};

export const createScopeFilters = async (type: MT, pagination: IPagination): Promise<FilterQuery<any> | undefined> => {
    let filters: FilterQuery<any>[] = (await Promise.all(pagination.scopes.map(scope => createScopeFilter(type, scope)))).filter(x => x !== undefined) as FilterQuery<any>[];

    if (filters.length === 0) {
        return undefined;
    } else if (filters.length === 1) {
        return filters[0];
    } else {
        return { $or: filters }
    }
};
