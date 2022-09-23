import type { IScope } from "./scope";

export interface IPagination {
    page: number;
    limit: number;
    sort?: string;
    scopes: string;
}

export const scopeArray = (...scopes: IScope[]): string => {
    return scopes.map(s => {
        if (s.link !== undefined) {
            return `${s.type}:${s.link}`
        } else {
            return s.type;
        }
    }).join(',');
}
