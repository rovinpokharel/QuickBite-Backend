import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

declare global {
    namespace Express {
      interface Request {
        userId: string;
        auth0Id: string;
        isAdmin: boolean;
        isRestaurantAdmin: boolean;
      }
    }
  }

export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});

export const jwtParse = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { authorization } = req.headers;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            res.sendStatus(401);
            return;
        }

        const token = authorization.split(" ")[1];
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        
        if (!decoded || !decoded.sub) {
            res.sendStatus(401);
            return;
        }

        const auth0Id = decoded.sub;
        const user = await User.findOne({ auth0Id });

        if (!user) {
            res.sendStatus(401);
            return;
        }

        req.auth0Id = auth0Id;
        req.userId = user._id.toString();
        req.isAdmin = user.admin;
        req.isRestaurantAdmin = user.restaurantAdmin;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.sendStatus(401);
        return;
    }
};

export const checkAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.isAdmin) {
        res.status(403).json({ message: "Unauthorized" });
        return;
    }
    next();
};

export const checkRestaurantAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.isRestaurantAdmin) {
        res.status(403).json({ message: "Unauthorized" });
        return;
    }
    next();
};