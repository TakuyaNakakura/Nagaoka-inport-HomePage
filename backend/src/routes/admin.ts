import { PublishStatus, Role, SitePageKey, UserStatus } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAdmin } from "../auth/middleware";
import { hashPassword } from "../auth/password";
import { invalidateUserSessions } from "../auth/session";
import {
  asyncHandler,
  badRequest,
  invariant,
  notFound,
  parsePagination,
  sendZodError
} from "../lib/http";
import {
  serializeActivityReport,
  serializeCenter,
  serializeCompany,
  serializeNews,
  serializeSitePage,
  serializeSupportProject,
  serializeTechSeed,
  serializeUser,
  withPagination
} from "../lib/serializers";

const publishStatusSchema = z.enum(["draft", "published"]);
const nullableString = z.string().trim().optional().nullable();
const idArraySchema = z.array(z.string().trim().min(1)).default([]);

const newsSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  body: z.string().trim().min(1, "本文は必須です"),
  category: z.string().trim().min(1, "カテゴリは必須です"),
  publishStatus: publishStatusSchema
});

const centerSchema = z.object({
  domain: z.string().trim().min(1, "担当領域は必須です"),
  summary: z.string().trim().min(1, "概要は必須です"),
  mainActivities: z.string().trim().min(1, "主な取り組みは必須です"),
  companyRelation: nullableString
});

const activityReportSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  body: z.string().trim().min(1),
  category: nullableString,
  publishStatus: publishStatusSchema,
  centerIds: idArraySchema,
  projectIds: idArraySchema
});

const supportProjectSchema = z.object({
  projectName: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  background: z.string().trim().min(1),
  issue: z.string().trim().min(1),
  goal: z.string().trim().min(1),
  supportNeeded: z.string().trim().min(1),
  expectedResult: nullableString,
  contactInfo: nullableString,
  publishStatus: publishStatusSchema,
  centerIds: idArraySchema,
  reportIds: idArraySchema
});

const companySchema = z.object({
  companyName: z.string().trim().min(1),
  industry: z.string().trim().min(1),
  address: nullableString,
  businessSummary: nullableString,
  interestTheme: nullableString,
  contactInfo: nullableString,
  isActive: z.boolean().default(true)
});

const techSeedSchema = z.object({
  companyId: z.string().trim().min(1),
  seedName: z.string().trim().min(1),
  seedSummary: z.string().trim().min(1),
  applicationField: nullableString,
  usageExample: nullableString,
  strength: nullableString,
  relatedResults: nullableString,
  collaborationTheme: nullableString
});

const userCreateSchema = z.object({
  loginId: z.string().trim().min(1),
  email: z.string().trim().email("メールアドレス形式が正しくありません"),
  userName: z.string().trim().min(1),
  role: z.enum(["admin", "member"]),
  companyId: nullableString,
  status: z.enum(["active", "disabled"]).default("active")
});

const userUpdateSchema = userCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "更新項目を指定してください"
);

const sitePageSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1)
});

const toPublishStatus = (value: "draft" | "published") =>
  value === "published" ? PublishStatus.PUBLISHED : PublishStatus.DRAFT;

const toRole = (value: "admin" | "member") => (value === "admin" ? Role.ADMIN : Role.MEMBER);
const toUserStatus = (value: "active" | "disabled") =>
  value === "active" ? UserStatus.ACTIVE : UserStatus.DISABLED;

const publishedAtFromStatus = (status: PublishStatus, current?: Date | null) =>
  status === PublishStatus.PUBLISHED ? current ?? new Date() : null;

const tempPassword = () => randomBytes(6).toString("base64url");

export const adminRouter = Router();

adminRouter.use((req, _res, next) => {
  requireAdmin(req);
  next();
});

adminRouter.get(
  "/news",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.news.findMany({ orderBy: { updatedAt: "desc" }, skip, take }),
      prisma.news.count()
    ]);

    res.json(withPagination(items.map(serializeNews), total, page, pageSize));
  })
);

adminRouter.get(
  "/news/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.news.findUnique({ where: { id: req.params.id } }),
      "お知らせが見つかりません"
    );
    res.json({ item: serializeNews(item) });
  })
);

adminRouter.post(
  "/news",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = newsSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const status = toPublishStatus(parsed.data.publishStatus);
    const item = await prisma.news.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        category: parsed.data.category,
        publishStatus: status,
        publishedAt: publishedAtFromStatus(status),
        createdBy: auth.userId,
        updatedBy: auth.userId
      }
    });

    res.status(201).json({ item: serializeNews(item) });
  })
);

adminRouter.patch(
  "/news/:id",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = newsSchema.partial().safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const current = invariant(
      await prisma.news.findUnique({ where: { id: req.params.id } }),
      "お知らせが見つかりません"
    );

    const status = parsed.data.publishStatus
      ? toPublishStatus(parsed.data.publishStatus)
      : current.publishStatus;

    const item = await prisma.news.update({
      where: { id: req.params.id },
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        category: parsed.data.category,
        publishStatus: status,
        publishedAt: publishedAtFromStatus(status, current.publishedAt),
        updatedBy: auth.userId
      }
    });

    res.json({ item: serializeNews(item) });
  })
);

adminRouter.delete(
  "/news/:id",
  asyncHandler(async (req, res) => {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

adminRouter.get(
  "/centers",
  asyncHandler(async (_req, res) => {
    const items = await prisma.center.findMany({ orderBy: { centerName: "asc" } });
    res.json({ items: items.map(serializeCenter) });
  })
);

adminRouter.patch(
  "/centers/:id",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = centerSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const item = await prisma.center.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        updatedBy: auth.userId
      }
    });

    res.json({ item: serializeCenter(item) });
  })
);

adminRouter.get(
  "/activity-reports",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.activityReport.findMany({
        include: {
          centerRelations: { include: { center: true } },
          projectRelations: { include: { supportProject: true } }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take
      }),
      prisma.activityReport.count()
    ]);

    res.json(withPagination(items.map(serializeActivityReport), total, page, pageSize));
  })
);

adminRouter.get(
  "/activity-reports/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.activityReport.findUnique({
        where: { id: req.params.id },
        include: {
          centerRelations: { include: { center: true } },
          projectRelations: { include: { supportProject: true } }
        }
      }),
      "活動報告が見つかりません"
    );
    res.json({ item: serializeActivityReport(item) });
  })
);

adminRouter.post(
  "/activity-reports",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = activityReportSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const status = toPublishStatus(parsed.data.publishStatus);
    const item = await prisma.activityReport.create({
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary,
        body: parsed.data.body,
        category: parsed.data.category,
        publishStatus: status,
        publishedAt: publishedAtFromStatus(status),
        createdBy: auth.userId,
        updatedBy: auth.userId,
        centerRelations: {
          create: parsed.data.centerIds.map((centerId) => ({ centerId }))
        },
        projectRelations: {
          create: parsed.data.projectIds.map((supportProjectId) => ({ supportProjectId }))
        }
      },
      include: {
        centerRelations: { include: { center: true } },
        projectRelations: { include: { supportProject: true } }
      }
    });

    res.status(201).json({ item: serializeActivityReport(item) });
  })
);

adminRouter.patch(
  "/activity-reports/:id",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = activityReportSchema.partial().safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const current = invariant(
      await prisma.activityReport.findUnique({ where: { id: req.params.id } }),
      "活動報告が見つかりません"
    );

    const status = parsed.data.publishStatus
      ? toPublishStatus(parsed.data.publishStatus)
      : current.publishStatus;

    await prisma.activityReport.update({
      where: { id: req.params.id },
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary,
        body: parsed.data.body,
        category: parsed.data.category,
        publishStatus: status,
        publishedAt: publishedAtFromStatus(status, current.publishedAt),
        updatedBy: auth.userId,
        ...(parsed.data.centerIds
          ? {
              centerRelations: {
                deleteMany: {},
                create: parsed.data.centerIds.map((centerId) => ({ centerId }))
              }
            }
          : {}),
        ...(parsed.data.projectIds
          ? {
              projectRelations: {
                deleteMany: {},
                create: parsed.data.projectIds.map((supportProjectId) => ({ supportProjectId }))
              }
            }
          : {})
      }
    });

    const item = invariant(
      await prisma.activityReport.findUnique({
        where: { id: req.params.id },
        include: {
          centerRelations: { include: { center: true } },
          projectRelations: { include: { supportProject: true } }
        }
      }),
      "活動報告が見つかりません"
    );
    res.json({ item: serializeActivityReport(item) });
  })
);

adminRouter.delete(
  "/activity-reports/:id",
  asyncHandler(async (req, res) => {
    await prisma.activityReport.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

adminRouter.get(
  "/support-projects",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.supportProject.findMany({
        include: {
          centerRelations: { include: { center: true } },
          reportRelations: { include: { activityReport: true } }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take
      }),
      prisma.supportProject.count()
    ]);

    res.json(withPagination(items.map(serializeSupportProject), total, page, pageSize));
  })
);

adminRouter.get(
  "/support-projects/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.supportProject.findUnique({
        where: { id: req.params.id },
        include: {
          centerRelations: { include: { center: true } },
          reportRelations: { include: { activityReport: true } }
        }
      }),
      "支援プロジェクトが見つかりません"
    );
    res.json({ item: serializeSupportProject(item) });
  })
);

adminRouter.post(
  "/support-projects",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = supportProjectSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const status = toPublishStatus(parsed.data.publishStatus);
    const item = await prisma.supportProject.create({
      data: {
        projectName: parsed.data.projectName,
        summary: parsed.data.summary,
        background: parsed.data.background,
        issue: parsed.data.issue,
        goal: parsed.data.goal,
        supportNeeded: parsed.data.supportNeeded,
        expectedResult: parsed.data.expectedResult,
        contactInfo: parsed.data.contactInfo,
        publishStatus: status,
        publishedAt: publishedAtFromStatus(status),
        createdBy: auth.userId,
        updatedBy: auth.userId,
        centerRelations: {
          create: parsed.data.centerIds.map((centerId) => ({ centerId }))
        },
        reportRelations: {
          create: parsed.data.reportIds.map((activityReportId) => ({ activityReportId }))
        }
      },
      include: {
        centerRelations: { include: { center: true } },
        reportRelations: { include: { activityReport: true } }
      }
    });

    res.status(201).json({ item: serializeSupportProject(item) });
  })
);

adminRouter.patch(
  "/support-projects/:id",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = supportProjectSchema.partial().safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const current = invariant(
      await prisma.supportProject.findUnique({ where: { id: req.params.id } }),
      "支援プロジェクトが見つかりません"
    );

    const status = parsed.data.publishStatus
      ? toPublishStatus(parsed.data.publishStatus)
      : current.publishStatus;

    await prisma.supportProject.update({
      where: { id: req.params.id },
      data: {
        projectName: parsed.data.projectName,
        summary: parsed.data.summary,
        background: parsed.data.background,
        issue: parsed.data.issue,
        goal: parsed.data.goal,
        supportNeeded: parsed.data.supportNeeded,
        expectedResult: parsed.data.expectedResult,
        contactInfo: parsed.data.contactInfo,
        publishStatus: status,
        publishedAt: publishedAtFromStatus(status, current.publishedAt),
        updatedBy: auth.userId,
        ...(parsed.data.centerIds
          ? {
              centerRelations: {
                deleteMany: {},
                create: parsed.data.centerIds.map((centerId) => ({ centerId }))
              }
            }
          : {}),
        ...(parsed.data.reportIds
          ? {
              reportRelations: {
                deleteMany: {},
                create: parsed.data.reportIds.map((activityReportId) => ({ activityReportId }))
              }
            }
          : {})
      }
    });

    const item = invariant(
      await prisma.supportProject.findUnique({
        where: { id: req.params.id },
        include: {
          centerRelations: { include: { center: true } },
          reportRelations: { include: { activityReport: true } }
        }
      }),
      "支援プロジェクトが見つかりません"
    );
    res.json({ item: serializeSupportProject(item) });
  })
);

adminRouter.delete(
  "/support-projects/:id",
  asyncHandler(async (req, res) => {
    await prisma.supportProject.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

adminRouter.get(
  "/companies",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.company.findMany({
        include: { users: true, techSeeds: true },
        orderBy: { companyName: "asc" },
        skip,
        take
      }),
      prisma.company.count()
    ]);

    res.json(withPagination(items.map(serializeCompany), total, page, pageSize));
  })
);

adminRouter.get(
  "/companies/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.company.findUnique({
        where: { id: req.params.id },
        include: {
          users: true,
          techSeeds: true
        }
      }),
      "企業情報が見つかりません"
    );
    res.json({ item: serializeCompany(item) });
  })
);

adminRouter.post(
  "/companies",
  asyncHandler(async (req, res) => {
    const parsed = companySchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const item = await prisma.company.create({
      data: parsed.data
    });

    res.status(201).json({ item: serializeCompany(item) });
  })
);

adminRouter.patch(
  "/companies/:id",
  asyncHandler(async (req, res) => {
    const parsed = companySchema.partial().safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const item = await prisma.company.update({
      where: { id: req.params.id },
      data: parsed.data
    });

    res.json({ item: serializeCompany(item) });
  })
);

adminRouter.delete(
  "/companies/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.company.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ item: serializeCompany(item) });
  })
);

adminRouter.get(
  "/tech-seeds",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.techSeed.findMany({
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              industry: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take
      }),
      prisma.techSeed.count()
    ]);

    res.json(withPagination(items.map(serializeTechSeed), total, page, pageSize));
  })
);

adminRouter.get(
  "/tech-seeds/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.techSeed.findUnique({
        where: { id: req.params.id },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              industry: true
            }
          }
        }
      }),
      "技術シーズが見つかりません"
    );
    res.json({ item: serializeTechSeed(item) });
  })
);

adminRouter.post(
  "/tech-seeds",
  asyncHandler(async (req, res) => {
    const parsed = techSeedSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const item = await prisma.techSeed.create({
      data: parsed.data,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            industry: true
          }
        }
      }
    });

    res.status(201).json({ item: serializeTechSeed(item) });
  })
);

adminRouter.patch(
  "/tech-seeds/:id",
  asyncHandler(async (req, res) => {
    const parsed = techSeedSchema.partial().safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const item = await prisma.techSeed.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            industry: true
          }
        }
      }
    });

    res.json({ item: serializeTechSeed(item) });
  })
);

adminRouter.delete(
  "/tech-seeds/:id",
  asyncHandler(async (req, res) => {
    await prisma.techSeed.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

adminRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          company: {
            select: {
              id: true,
              companyName: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.user.count()
    ]);

    res.json(withPagination(items.map(serializeUser), total, page, pageSize));
  })
);

adminRouter.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.user.findUnique({
        where: { id: req.params.id },
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
    res.json({ item: serializeUser(item) });
  })
);

adminRouter.post(
  "/users",
  asyncHandler(async (req, res) => {
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    if (parsed.data.role === "member" && !parsed.data.companyId) {
      badRequest("会員企業ユーザーには所属企業が必要です");
    }

    if (parsed.data.role === "admin" && parsed.data.companyId) {
      badRequest("管理者ユーザーには所属企業を設定できません");
    }

    const generatedPassword = tempPassword();

    const item = await prisma.user.create({
      data: {
        loginId: parsed.data.loginId,
        email: parsed.data.email,
        userName: parsed.data.userName,
        role: toRole(parsed.data.role),
        companyId: parsed.data.companyId ?? null,
        status: toUserStatus(parsed.data.status),
        passwordHash: await hashPassword(generatedPassword),
        mustChangePassword: true
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

    res.status(201).json({
      item: serializeUser(item),
      tempPassword: generatedPassword
    });
  })
);

adminRouter.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    if (parsed.data.role === "member" && !parsed.data.companyId) {
      badRequest("会員企業ユーザーには所属企業が必要です");
    }

    if (parsed.data.role === "admin" && parsed.data.companyId) {
      badRequest("管理者ユーザーには所属企業を設定できません");
    }

    const item = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        loginId: parsed.data.loginId,
        email: parsed.data.email,
        userName: parsed.data.userName,
        role: parsed.data.role ? toRole(parsed.data.role) : undefined,
        companyId:
          parsed.data.role === "admin"
            ? null
            : parsed.data.companyId === undefined
              ? undefined
              : parsed.data.companyId,
        status: parsed.data.status ? toUserStatus(parsed.data.status) : undefined
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

    res.json({ item: serializeUser(item) });
  })
);

adminRouter.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        status: UserStatus.DISABLED
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

    await invalidateUserSessions(req.params.id);

    res.json({ item: serializeUser(item) });
  })
);

adminRouter.post(
  "/users/:id/reset-password",
  asyncHandler(async (req, res) => {
    const generatedPassword = tempPassword();
    const item = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        passwordHash: await hashPassword(generatedPassword),
        mustChangePassword: true
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

    await invalidateUserSessions(req.params.id);

    res.json({
      item: serializeUser(item),
      tempPassword: generatedPassword
    });
  })
);

adminRouter.get(
  "/site-pages/about",
  asyncHandler(async (_req, res) => {
    const page = invariant(
      await prisma.sitePage.findUnique({
        where: { pageKey: SitePageKey.ABOUT_TERMS }
      }),
      "サイト情報が見つかりません"
    );
    res.json({ item: serializeSitePage(page) });
  })
);

adminRouter.patch(
  "/site-pages/about",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    const parsed = sitePageSchema.safeParse(req.body);
    if (!parsed.success) throw sendZodError(parsed.error);

    const item = await prisma.sitePage.update({
      where: { pageKey: SitePageKey.ABOUT_TERMS },
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        updatedBy: auth.userId
      }
    });

    res.json({ item: serializeSitePage(item) });
  })
);

adminRouter.get(
  "/reference-data",
  asyncHandler(async (_req, res) => {
    const [centers, companies, supportProjects, activityReports] = await Promise.all([
      prisma.center.findMany({ orderBy: { centerName: "asc" } }),
      prisma.company.findMany({ where: { isActive: true }, orderBy: { companyName: "asc" } }),
      prisma.supportProject.findMany({ orderBy: { projectName: "asc" } }),
      prisma.activityReport.findMany({ orderBy: { title: "asc" } })
    ]);

    res.json({
      centers: centers.map((center) => ({
        id: center.id,
        label: center.centerName
      })),
      companies: companies.map((company) => ({
        id: company.id,
        label: company.companyName
      })),
      supportProjects: supportProjects.map((project) => ({
        id: project.id,
        label: project.projectName
      })),
      activityReports: activityReports.map((report) => ({
        id: report.id,
        label: report.title
      }))
    });
  })
);
