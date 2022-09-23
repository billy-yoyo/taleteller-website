import T, { ModelType } from "tsplate";
import { TStringScope } from "./scope";

export const TScopeQuery = T.Object({
    scope: TStringScope
});
export type IScopeQuery = ModelType<typeof TScopeQuery>;
