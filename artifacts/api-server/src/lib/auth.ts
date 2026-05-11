import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import type { ExpressRequestWithAuth } from "@clerk/express";

export type AuthedRequest = ExpressRequestWithAuth;

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

export const getUserId = (req: Request): string => {
  const auth = getAuth(req);
  return auth.userId!;
};
