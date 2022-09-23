import { getToken, setToken } from "../../store/auth";
import { navigate } from "svelte-navigator";

export class UnauthorizedError {}
export class RequestError {
    constructor(public status: number, public statusText: string, public body?: string) {}
}

interface RequestOptions {
    path: string;
    auth: boolean;
    method: string;
    json?: any;
    query?: Record<string, string | number>;
}

const buildHeaders = (options: RequestOptions) => {
    const headers: Record<string, string> = {};
    if (options.auth) {
        const token = getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            throw new UnauthorizedError();
        }
    }
    if (options.json !== undefined) {
        headers["Content-Type"] = 'application/json';
    }
    return headers;
};

const buildQuery = (options: RequestOptions) => {
    if (options.query) {
        const pairs = Object.entries(options.query).filter(([k, v]) => v !== undefined).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        if (pairs.length > 0) {
            return `?${pairs}`;
        } else {
            return '';
        }
    } else {
        return '';
    }
}

export const createFetch = async (options: RequestOptions) => {
    try {
        const response = await fetch(`${options.path}${buildQuery(options)}`, {
            headers: buildHeaders(options),
            method: options.method,
            body: options.json && JSON.stringify(options.json)
        });

        if (200 <= response.status && response.status < 300) {
            return response;
        } else if (response.status === 401) {
            throw new UnauthorizedError();
        } else {
            try {
                const body = await response.text();
                throw new RequestError(response.status, response.statusText, body);
            } catch(e) {
                throw new RequestError(response.status, response.statusText);
            }
        }
    } catch (e) {
        console.error(e);
        if (e instanceof UnauthorizedError) {
            await moveToLoginPage();

            throw e;
        } else {
            throw e;
        }
    }
};

const moveToLoginPage = async () => {
    setToken(undefined);
    navigate("/login");
};


