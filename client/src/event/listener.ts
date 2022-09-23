import { receiveEvent } from "./receiver";
import { getToken } from "../store/auth";
import { navigate } from "svelte-navigator";

interface Registration {
    token: string;
}

const CONNECTION_TIMEOUT = 10_000;
const RECONNECT_COOLDOWN = 10_000;
const MAX_RETRIES = 5;

const createWebocketUrl = () => {
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${host}/ws/connect`;
};

const createWebSocket = (factory: (close: () => void) => void, retries: number = 0) => {
    const ws = new WebSocket(createWebocketUrl());
    let canRestart = true;
    let connected = false;

    const reconnect = () => {
        try {
            ws.close();
        } catch (e) {}
        
        if (canRestart) {
            if (retries < MAX_RETRIES) {
                setTimeout(() => {
                    factory(createWebSocket(factory, retries + 1));
                }, RECONNECT_COOLDOWN);
            } else {
                console.error('Too many retries, giving up on websocket connection');
            }
        }
    };

    ws.onclose = reconnect;

    ws.onmessage = (wsEvent) => {
        try {
            const event = JSON.parse(wsEvent.data);
            if (event.type === 'connected') {
                connected = true;
                console.log('websocket connected.');
            } else {
                receiveEvent(event);
            }
        } catch(e) {
            console.error('Invalid event received from the server', e);
        }
    };

    ws.onopen = () => {
        // send registration message authenticating this websocket connection
        const registration: Registration = {
            token: getToken()
        };

        
        if (!registration.token) {
            navigate('/login');
        } else {
            ws.send(JSON.stringify(registration));
    
            // if we don't receive a 'connected' event within the timeout we try again
            setTimeout(() => {
                if (!connected) {
                    reconnect();
                }
            }, CONNECTION_TIMEOUT);
        }
    };

    return () => {
        canRestart = false;
        ws.close();
    };
};

export const createListener = () => {
    let close;
    
    createWebSocket((closeFunc) => close = closeFunc);
    
    return () => {
        close();
    };
};


