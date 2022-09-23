import { setToken } from "../../store/auth";
import { createFetch } from "./apiFetch";
import * as me from "../../store/me";

export const login = async (username: string, password: string) => {
    me.setUser(undefined);
    try {
        const response = await createFetch({
            path: '/auth/login',
            method: 'POST',
            auth: false,
            json: { username, password }
        });
        const { token, user } = await response.json();
        if (token) {
            setToken(token);
            me.setUser(user);
            return true;
        } else {
            return false;
        }
    } catch (e: any) {
        return false;
    }
};

export const signup = async (name: string, username: string, password: string) => {
    try {
        const response = await createFetch({
            path: '/auth/login',
            method: 'POST',
            auth: false,
            json: { name, username, password }
        });
        const { user } = await response.json();
        if (user !== undefined) {
            return await login(username, password)
        } else {
            return false;
        }
    } catch (e: any) {
        return false;
    }
}
