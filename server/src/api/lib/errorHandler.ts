import * as express from "express";

export const errorHandler = (endpoint: (req: express.Request, res: express.Response) => Promise<any>) => {
    return async (req: express.Request, res: express.Response) => {
        try {
            await endpoint(req, res);
        } catch(e: any) {
            console.error(e);
            res.status(500).send(e.message);
        }
    };
}
