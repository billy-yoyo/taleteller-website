import { ObjectId } from "mongodb";
import { User, DBUser } from "../../db/models/user";
import { UserMap, TUser, TPartialUser, mapUserUpdate } from "../models/user";
import { TObjectId } from "../models/helpers/objectId";
import { ModelResponse } from "./lib/modelResponseBuilder";
import { modelUpdater } from "./lib/updater";
import { modelCreator } from "./lib/creator";
import { modelGetter } from "./lib/getter";
import { modelDeleter } from "./lib/deleter";

export const getUserModelResponseByIds = async (ids: ObjectId[], parent?: ModelResponse): Promise<ModelResponse[]> => {
    const filteredIds = parent !== undefined ? ids.filter(id => parent.has('user', TObjectId.toTransit(id))) : ids;
    if (filteredIds.length > 0) {
        const users = await User.find({ _id: { $in: filteredIds } });
        return await Promise.all(users.map(user => getUserModelResponse(user, parent)));
    } else {
        return [];
    }
};

export const getUserModelResponse = async (user: DBUser, parent?: ModelResponse): Promise<ModelResponse> => {
    const response = new ModelResponse('user', TUser.toTransit(UserMap.toTransit(user)), parent);
    return response;
};

export const getUsers = modelGetter(getUserModelResponseByIds);
export const createUser = modelCreator(TUser, UserMap);
export const updateUser = modelUpdater(TPartialUser, User, mapUserUpdate);
export const deleteUser = modelDeleter(User);
