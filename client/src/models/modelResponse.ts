import type { ModelType } from "./model";

export interface IModelResponse {
    model: any;
    children: {[type in ModelType]?: any[]}
}
