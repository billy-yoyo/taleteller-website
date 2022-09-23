import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBScope, Scopes } from "../../db/models/scope";
import { TObjectId } from "./helpers/objectId";

export const TScope = T.Object({
    type: T.Enum(...Scopes),
    link: T.Optional(TObjectId)
});
export type IScope = ModelType<typeof TScope>;

export const TStringScope: Template<IScope, string> = {
    valid: (o: any): o is string => {
        if (T.String.valid(o)) {
            const parts = o.split(":");
            if (parts.length <= 2) {
                return TScope.valid({ type: parts[0], link: parts[1] })
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    toModel: (o: string) => {
        const parts = o.split(":");
        return TScope.toModel({ type: parts[0], link: parts[1] })
    },
    toTransit: (s: IScope) => {
        if (s.link !== undefined) {
            return `${s.type}:${TObjectId.toTransit(s.link)}`
        } else {
            return s.type;
        }
    }
};

export const mapToApi = (scope: DBScope): IScope => {
    return {
        type: scope.type,
        link: scope.link
    }
};

export const mapToDb = (scope: IScope): DBScope => {
    return {
        type: scope.type,
        link: scope.link
    }
};

export const ScopeMap: Template<DBScope, IScope> = {
    valid: (t: any): t is IScope => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapScopeUpdate = (scope: DeepPartial<IScope> | undefined): DeepPartial<DBScope> | undefined => {
    return scope === undefined ? undefined : {
        type: scope.type,
        link: scope.link
    }
};
