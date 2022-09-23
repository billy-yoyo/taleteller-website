import { DBSource, ModelTypes } from "../../db/models/source";
import T, { DeepPartial, ModelType, Template } from "tsplate";
import { TObjectId } from "./helpers/objectId";

export const TSource = T.Object({
    type: T.Enum(...ModelTypes),
    id: TObjectId
});
export type ISource = ModelType<typeof TSource>;

export const mapToApi = (source: DBSource): ISource => {
    return {
        type: source.type,
        id: source.id
    }
};

export const mapToDb = (source: ISource): DBSource => {
    return {
        type: source.type,
        id: source.id
    }
};

export const SourceMap: Template<DBSource, ISource> = {
    valid: (t: any): t is ISource => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapSourceUpdate = (source: DeepPartial<ISource> | undefined): DeepPartial<DBSource> | undefined => {
    return source === undefined ? undefined : {
        type: source.type,
        id: source.id
    };
};
