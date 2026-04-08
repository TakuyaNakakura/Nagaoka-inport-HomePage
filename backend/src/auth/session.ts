import { createHash, randomBytes } from "node:crypto";
import type { Response } from "express";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../db";
import { config } from "../config";

export const SESSION_COOKIE_NAME = "portal_session";
const SESSION_TTL_DAYS = 14;

export type AuthContext = {
  userId: string;
  loginId: string;
  email: string;
  userName: string;
  role: "admin" | "member";
  status: "active" | "disabled";
  companyId: string | null;
  mustChangePassword: boolean;
};

const hashToken = (token: string) =>
  createHash("sha256").update(`${token}:${config.sessionSecret}`).digest("hex");

export const createSession = async (userId: string) => {
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt
    }
  });

  return { rawToken, expiresAt };
};

export const invalidateSession = async (rawToken?: string) => {
  if (!rawToken) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      tokenHash: hashToken(rawToken)
    }
  });
};

export const invalidateUserSessions = async (userId: string) => {
  await prisma.session.deleteMany({
    where: {
      userId
    }
  });
};

export const resolveSession = async (rawToken?: string): Promise<AuthContext | null> => {
  if (!rawToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(rawToken)
    },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({
      where: {
        id: session.id
      }
    });
    return null;
  }

  return {
    userId: session.user.id,
    loginId: session.user.loginId,
    email: session.user.email,
    userName: session.user.userName,
    role: session.user.role === Role.ADMIN ? "admin" : "member",
    status: session.user.status === UserStatus.ACTIVE ? "active" : "disabled",
    companyId: session.user.companyId ?? null,
    mustChangePassword: session.user.mustChangePassword
  };
};

export const setSessionCookie = (res: Response, rawToken: string, expiresAt: Date) => {
  res.cookie(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    path: "/",
    expires: expiresAt
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    path: "/"
  });
};

