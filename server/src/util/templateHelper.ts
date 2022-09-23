import { ObjectId } from "mongodb";
import { TObjectId } from "../api/models/helpers/objectId";
import T, { ModelType, Template } from "tsplate";
import { IScope, TScope } from "../api/models/scope";

interface DataTemplate<T extends string, DM extends {[key in T]: Template<any, any>}> {
    id?: ObjectId;
    type: T;
    data: ModelType<DM[T]>;
    scope: IScope;
}

const createDataTemplate = <T extends string, DM extends {[key in T]: Template<any, any>}>(type: T, dataMapper: DM) => {
    return T.Object({
        id: T.Optional(TObjectId),
        type: T.Enum(type),
        data: dataMapper[type],
        scope: TScope
    }) as any as Template<DataTemplate<T, DM>, any>;
};

interface NonScopedDataTemplate<T extends string, DM extends {[key in T]: Template<any, any>}> {
    id: number;
    type: T;
    data: ModelType<DM[T]>;
}

const createNonScopedDataTemplate = <T extends string, DM extends {[key in T]: Template<any, any>}>(type: T, dataMapper: DM) => {
    return T.Object({
        id: T.Optional(T.String),
        type: T.Enum(type),
        data: dataMapper[type],
    }) as any as Template<NonScopedDataTemplate<T, DM>, any>;
};

export const createUnion = <T extends string, DM extends {[key in T]: Template<any, any>}>(dataMapper: DM) => {
    const keys = Object.keys(dataMapper) as T[];
    let template = createDataTemplate(keys[0], dataMapper);
    keys.slice(1).forEach(key => {
        template = T.Union(
            createDataTemplate(key, dataMapper),
            template,
            (m: DataTemplate<T, DM>): m is DataTemplate<T, DM> => m.type === key
        ) as any as Template<DataTemplate<T, DM>, any>;
    });
    return template;
};

export const createNonScopedUnion = <T extends string, DM extends {[key in T]: Template<any, any>}>(dataMapper: DM) => {
    const keys = Object.keys(dataMapper) as T[];
    let template = createNonScopedDataTemplate(keys[0], dataMapper);
    keys.slice(1).forEach(key => {
        template = T.Union(
            createNonScopedDataTemplate(key, dataMapper),
            template,
            (m: NonScopedDataTemplate<T, DM>): m is NonScopedDataTemplate<T, DM> => m.type === key
        ) as any as Template<NonScopedDataTemplate<T, DM>, any>;
    });
    return template;
};


