import * as express from "express";

export const decodeQuery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.query = Object.fromEntries(Object.entries(req.query).map(([key, value]) => typeof value === 'string' ? [key, decodeURIComponent(value as string)] : [key, value]));
    next();
};
