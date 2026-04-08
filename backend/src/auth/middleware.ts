import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../lib/http";
import { clearSessionCookie, resolveSession, SESSION_COOKIE_NAME } from "./session";

export const attachAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    const auth = await resolveSession(sessionToken);

    if (auth?.status === "disabled") {
      clearSessionCookie(res);
      req.auth = undefined;
      return next();
    }

    req.auth = auth ?? undefined;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAuth = (req: Request) => {
  if (!req.auth) {
    unauthorized();
  }

  return req.auth!;
};

export const requireAdmin = (req: Request) => {
  const auth = requireAuth(req);

  if (auth.role !== "admin") {
    forbidden("Admin access required");
  }

  return auth;
};

