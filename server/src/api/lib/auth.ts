import * as fs from "fs/promises";
import * as dotenv from "dotenv";
import { DBUser, User } from "../../db/models/user";
import * as jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import * as express from "express";
import { ObjectId } from "mongodb";

declare global {
    namespace Express {
        export interface Request {
            auth: { userId: string; user: DBUser; }
        }
    }
}

const JWT_ALGORITHM = "HS256";
let JWT_SECRET: Buffer;

export interface TokenData {
    userId: string;
}

export const initAuth = async () => {
    dotenv.config();

    JWT_SECRET = await fs.readFile(process.env.JWT_SECRET || "");
};

export const createToken = (user: DBUser): string => {
    const data: TokenData = {
        userId: user._id.toHexString()
    };

    return jwt.sign(data, JWT_SECRET, { algorithm: JWT_ALGORITHM });
};

export const authHeader = () => {
    return expressjwt({ secret: JWT_SECRET, algorithms: [ JWT_ALGORITHM ] });
};

export const verifyToken = async (token: string): Promise<ObjectId> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                const data = decoded as TokenData;
                resolve(new ObjectId(data.userId));
            }
        });
    });
};

export const fetchAuthUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const userId = new ObjectId(req.auth.userId);
        const user = await User.findById(userId);
        if (user) {
            req.auth.user = user;
            next();
        } else {
            res.status(401).send();
        }
    } catch (e: any) {
        res.status(401).send();
    }
};
