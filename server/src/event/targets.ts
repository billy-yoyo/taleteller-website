import { WebSocket } from "ws";
import T from "tsplate";
import { verifyToken } from "../api/lib/auth";

interface Target {
    counter: number;
    sockets: {[socketId: string]: WebSocket};
}

const TRegistration = T.Object({
    token: T.String
});

const targets: {[id: string]: Target} = {};

export const waitForSocketRegistration = (socket: WebSocket) => {
    let connected = false;
    
    socket.on('message', async (rawData) => {
        if (!connected) {
            const data = JSON.parse(rawData.toString('utf8'));
            if (TRegistration.valid(data)) {
                const registration = TRegistration.toModel(data);
                try {
                    const userId = await verifyToken(registration.token);
                    connected = true;
                    registerSocket(userId.toHexString(), socket);
                } catch (err) {
                    console.error('failed to verify token');
                }
            }
        }
    });
};

export const registerSocket = (targetId: string, socket: WebSocket) => {    
    const target = targets[targetId];
    if (!target) {
        targets[targetId] = {
            counter: 2,
            sockets: { "1": socket }
        };
    } else {
        const socketId = `${target.counter++}`;
        target.sockets[socketId] = socket;
        
        socket.on('close', () => {
            delete target.sockets[socketId];
        });

        socket.send(JSON.stringify({ type: 'connected' }));
    }
};

export const sendToTarget = (targetId: string, data: string) => {
    const target = targets[targetId];
    if (target) {
        Object.values(target.sockets).forEach(socket => {
            socket.send(data);
        });
    }
};

export const sendToTargets = (targetIds: string[], data: string) => {
    targetIds.forEach(targetId => sendToTarget(targetId, data));
};
