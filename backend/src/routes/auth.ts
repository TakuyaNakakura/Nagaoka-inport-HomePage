import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { asyncHandler, badRequest, invariant, sendZodError, unauthorized } from "../lib/http";
import { verifyPassword, hashPassword } from "../auth/password";
import {
  clearSessionCookie,
  createSession,
  invalidateSession,
  setSessionCookie,
  SESSION_COOKIE_NAME
} from "../auth/session";
import { requireAuth } from "../auth/middleware";
import { serializeUser } from "../lib/serializers";

const loginSchema = z.object({
  loginOrEmail: z.string().trim().min(1, "ログインIDまたはメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください")
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "現在のパスワードを入力してください"),
  newPassword: z.string().min(8, "新しいパスワードは8文字以上で入力してください")
});

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw sendZodError(parsed.error);
    }

    const { loginOrEmail, password } = parsed.data;

    const foundUser = await prisma.user.findFirst({
      where: {
        OR: [{ loginId: loginOrEmail }, { email: loginOrEmail }]
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });

    const user = invariant(foundUser, "ログイン情報が正しくありません");

    if (user.status !== "ACTIVE") {
      unauthorized("ログイン情報が正しくありません");
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      unauthorized("ログイン情報が正しくありません");
    }

    const { rawToken, expiresAt } = await createSession(user.id);
    setSessionCookie(res, rawToken, expiresAt);

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        lastLoginAt: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });

    res.json({
      user: serializeUser(updatedUser)
    });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    await invalidateSession(token);
    clearSessionCookie(res);
    res.status(204).send();
  })
);

authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const user = invariant(
      await prisma.user.findUnique({
        where: { id: auth.userId },
        include: {
          company: {
            select: {
              id: true,
              companyName: true
            }
          }
        }
      }),
      "ユーザーが見つかりません"
    );

    if (user.status !== "ACTIVE") {
      unauthorized();
    }

    res.json({
      user: serializeUser(user)
    });
  })
);

authRouter.post(
  "/change-password",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      throw sendZodError(parsed.error);
    }

    const user = invariant(
      await prisma.user.findUnique({
        where: { id: auth.userId },
        include: {
          company: {
            select: {
              id: true,
              companyName: true
            }
          }
        }
      }),
      "ユーザーが見つかりません"
    );

    const isValid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      badRequest("現在のパスワードが正しくありません");
    }

    const nextUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        mustChangePassword: false
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });

    res.json({
      user: serializeUser(nextUser)
    });
  })
);
