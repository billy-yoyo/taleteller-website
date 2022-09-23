import { writable, Writable } from "svelte/store";
import type { ObjectID } from "../models/objectId";
import type { UnitID } from "../models/unit";
import type { IUser } from "../models/user";

export const user: Writable<IUser> = writable();

export const setUser = (model: IUser | undefined) => {
    user.set(model);
    localStorage.setItem('user', JSON.stringify(model));
};

export const initUser = () => {
    const model = localStorage.getItem('user');
    if (model) {
        user.set(JSON.parse(model));
    }
}

