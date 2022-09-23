import { ObjectId } from "mongodb";
import { FilterQuery } from "mongoose";

export const tagFilters = (filters: { tags?: string[] }): FilterQuery<{ tags: string[] }> => {
    return filters.tags === undefined ? {} : {
        tags: { $all: filters.tags }
    };
};

export const nameFilters = (filters: { name?: string }): FilterQuery<{ name: string }> => {
    return filters.name === undefined ? {} : {
        name: { $regex: `.*${filters.name.replace(/\s*/g, ".*")}.*`, $options: "i" }
    };
};

export const idFilters = (filters: { ids: ObjectId[] }): FilterQuery<{}> => {
    return filters.ids === undefined ? {} : {
        _id: { $in: filters.ids }
    }
}
