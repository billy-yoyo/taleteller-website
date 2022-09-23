import type { ObjectID } from "./objectId";

export const Scopes = ["global", "campaign", "character", "user", "channel"] as const;
export type ScopeType = (typeof Scopes)[number];

export interface IScope {
    type: ScopeType;
    link?: ObjectID;
}
