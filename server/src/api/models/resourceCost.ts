import T from "tsplate";

export const TResourceCost = T.Object({
    resourceShortName: T.String,
    amount: T.Int,
    variable: T.Optional(T.Boolean),
    makeFree: T.Optional(T.Boolean)
});
