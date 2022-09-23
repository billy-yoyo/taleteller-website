import { scopeArray } from "../models/pagination";
import type { IScope } from "../models/scope";
import { createFetch } from "./lib/apiFetch";

export const checkWriteAccess = async (...scopes: IScope[]) => {
    const resp = await createFetch({
        path: `/api/util/checkWriteAccess`,
        method: 'GET',
        auth: true,
        query: {
            scope: scopeArray(...scopes)
        }
    });
    const { hasAccess } = await resp.json();
    return hasAccess as boolean;
};
