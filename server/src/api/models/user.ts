import T, { DeepPartial, ModelType, Template } from "tsplate";
import { DBUser, User } from "../../db/models/user";
import { TObjectId } from "./helpers/objectId";

export const TUser = T.Object({
    id: T.Optional(TObjectId),
    name: T.String,
    admin: T.Boolean
});
export const TPartialUser = T.toPartial(TUser);
export type IUser = ModelType<typeof TUser>;

const mapToApi = (user: DBUser): IUser => {
    return {
        id: user._id,
        name: user.name,
        admin: user.admin
    }
};

const mapToDb = (user: IUser): DBUser => {
    return new User({
        _id: user.id,
        name: user.name,
        admin: user.admin
    });
}

export const UserMap: Template<DBUser, IUser> = {
    valid: (t: any): t is IUser => true,
    toModel: mapToDb,
    toTransit: mapToApi
};

export const mapUserUpdate = (user: DeepPartial<IUser> | undefined): DeepPartial<DBUser> | undefined => {
    return user === undefined ? undefined : {
        name: user.name
    };
};
