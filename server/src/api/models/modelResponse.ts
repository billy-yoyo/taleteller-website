import T, { ModelType } from "tsplate";

export const TModelResponse = T.Object({
    model: T.Any,
    children: T.Record(T.String, T.Array(T.Any))
});
export type IModelResponse = ModelType<typeof TModelResponse>;
