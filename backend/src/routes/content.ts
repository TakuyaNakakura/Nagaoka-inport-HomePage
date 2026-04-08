import { PublishStatus, SitePageKey } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAdmin, requireAuth } from "../auth/middleware";
import {
  asyncHandler,
  badRequest,
  forbidden,
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
  withPagination
} from "../lib/serializers";

const companyPatchSchema = z.object({
  companyName: z.string().trim().min(1, "企業名は必須です"),
  industry: z.string().trim().min(1, "業種は必須です"),
  address: z.string().trim().optional().nullable(),
  businessSummary: z.string().trim().optional().nullable(),
  interestTheme: z.string().trim().optional().nullable(),
  contactInfo: z.string().trim().optional().nullable()
});

const techSeedCreateSchema = z.object({
  seedName: z.string().trim().min(1, "技術シーズ名は必須です"),
  seedSummary: z.string().trim().min(1, "技術概要は必須です"),
  applicationField: z.string().trim().optional().nullable(),
  usageExample: z.string().trim().optional().nullable(),
  strength: z.string().trim().optional().nullable(),
  relatedResults: z.string().trim().optional().nullable(),
  collaborationTheme: z.string().trim().optional().nullable()
});

const techSeedPatchSchema = techSeedCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "更新項目を指定してください"
);

export const contentRouter = Router();

contentRouter.use((req, _res, next) => {
  requireAuth(req);
  next();
});

contentRouter.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    requireAuth(req);

    const [news, centers, reports, projects, companies, techSeeds] = await Promise.all([
      prisma.news.findMany({
        where: { publishStatus: PublishStatus.PUBLISHED },
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      prisma.center.findMany({
        orderBy: { updatedAt: "desc" },
        take: 3
      }),
      prisma.activityReport.findMany({
        where: { publishStatus: PublishStatus.PUBLISHED },
        include: {
          centerRelations: {
            include: {
              center: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      prisma.supportProject.findMany({
        where: { publishStatus: PublishStatus.PUBLISHED },
        include: {
          centerRelations: {
            include: {
              center: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
      prisma.company.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        take: 5
      }),
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
        take: 5
      })
    ]);

    res.json({
      news: news.map(serializeNews),
      centers: centers.map(serializeCenter),
      activityReports: reports.map(serializeActivityReport),
      supportProjects: projects.map(serializeSupportProject),
      companyUpdates: companies.map(serializeCompany),
      techSeedUpdates: techSeeds.map(serializeTechSeed)
    });
  })
);

contentRouter.get(
  "/news",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where: { publishStatus: PublishStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        skip,
        take
      }),
      prisma.news.count({
        where: { publishStatus: PublishStatus.PUBLISHED }
      })
    ]);

    res.json(withPagination(items.map(serializeNews), total, page, pageSize));
  })
);

contentRouter.get(
  "/news/:id",
  asyncHandler(async (req, res) => {
    const news = invariant(
      await prisma.news.findFirst({
        where: {
          id: req.params.id,
          publishStatus: PublishStatus.PUBLISHED
        }
      }),
      "お知らせが見つかりません"
    );

    res.json({ item: serializeNews(news) });
  })
);

contentRouter.get(
  "/centers",
  asyncHandler(async (_req, res) => {
    const items = await prisma.center.findMany({
      orderBy: { centerName: "asc" }
    });

    res.json({
      items: items.map(serializeCenter)
    });
  })
);

contentRouter.get(
  "/centers/:id",
  asyncHandler(async (req, res) => {
    const center = invariant(
      await prisma.center.findUnique({
        where: { id: req.params.id },
        include: {
          reportRelations: {
            include: {
              activityReport: true
            }
          },
          projectRelations: {
            include: {
              supportProject: true
            }
          }
        }
      }),
      "センター情報が見つかりません"
    );

    res.json({
      item: serializeCenter({
        ...center,
        reportRelations: center.reportRelations.filter(
          (relation) => relation.activityReport.publishStatus === PublishStatus.PUBLISHED
        ),
        projectRelations: center.projectRelations.filter(
          (relation) => relation.supportProject.publishStatus === PublishStatus.PUBLISHED
        )
      })
    });
  })
);

contentRouter.get(
  "/activity-reports",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.activityReport.findMany({
        where: { publishStatus: PublishStatus.PUBLISHED },
        include: {
          centerRelations: {
            include: { center: true }
          }
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take
      }),
      prisma.activityReport.count({
        where: { publishStatus: PublishStatus.PUBLISHED }
      })
    ]);

    res.json(withPagination(items.map(serializeActivityReport), total, page, pageSize));
  })
);

contentRouter.get(
  "/activity-reports/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.activityReport.findFirst({
        where: {
          id: req.params.id,
          publishStatus: PublishStatus.PUBLISHED
        },
        include: {
          centerRelations: {
            include: { center: true }
          },
          projectRelations: {
            include: { supportProject: true }
          }
        }
      }),
      "活動報告が見つかりません"
    );

    res.json({ item: serializeActivityReport(item) });
  })
);

contentRouter.get(
  "/support-projects",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.supportProject.findMany({
        where: { publishStatus: PublishStatus.PUBLISHED },
        include: {
          centerRelations: {
            include: { center: true }
          }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take
      }),
      prisma.supportProject.count({
        where: { publishStatus: PublishStatus.PUBLISHED }
      })
    ]);

    res.json(withPagination(items.map(serializeSupportProject), total, page, pageSize));
  })
);

contentRouter.get(
  "/support-projects/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.supportProject.findFirst({
        where: {
          id: req.params.id,
          publishStatus: PublishStatus.PUBLISHED
        },
        include: {
          centerRelations: {
            include: { center: true }
          },
          reportRelations: {
            include: { activityReport: true }
          }
        }
      }),
      "支援プロジェクトが見つかりません"
    );

    res.json({ item: serializeSupportProject(item) });
  })
);

contentRouter.get(
  "/companies",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        orderBy: { companyName: "asc" },
        skip,
        take
      }),
      prisma.company.count({
        where: { isActive: true }
      })
    ]);

    res.json(withPagination(items.map(serializeCompany), total, page, pageSize));
  })
);

contentRouter.get(
  "/companies/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.company.findFirst({
        where: {
          id: req.params.id,
          isActive: true
        },
        include: {
          techSeeds: {
            orderBy: { updatedAt: "desc" }
          }
        }
      }),
      "企業情報が見つかりません"
    );

    res.json({ item: serializeCompany(item) });
  })
);

contentRouter.get(
  "/tech-seeds",
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const applicationField =
      typeof req.query.applicationField === "string" ? req.query.applicationField.trim() : "";

    const where = {
      company: {
        isActive: true
      },
      ...(applicationField ? { applicationField } : {}),
      ...(q
        ? {
            OR: [
              { seedName: { contains: q, mode: "insensitive" as const } },
              { seedSummary: { contains: q, mode: "insensitive" as const } },
              { collaborationTheme: { contains: q, mode: "insensitive" as const } },
              {
                company: {
                  companyName: { contains: q, mode: "insensitive" as const }
                }
              }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.techSeed.findMany({
        where,
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
      prisma.techSeed.count({ where })
    ]);

    res.json(withPagination(items.map(serializeTechSeed), total, page, pageSize));
  })
);

contentRouter.get(
  "/tech-seeds/:id",
  asyncHandler(async (req, res) => {
    const item = invariant(
      await prisma.techSeed.findFirst({
        where: {
          id: req.params.id,
          company: {
            isActive: true
          }
        },
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

contentRouter.get(
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

contentRouter.get(
  "/me/tech-seeds",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const companyId = invariant(auth.companyId, "自社に紐づく企業がありません");

    const items = await prisma.techSeed.findMany({
      where: { companyId },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            industry: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json({ items: items.map(serializeTechSeed) });
  })
);

contentRouter.patch(
  "/me/company",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const companyId = invariant(auth.companyId, "自社に紐づく企業がありません");

    const parsed = companyPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw sendZodError(parsed.error);
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: parsed.data
    });

    res.json({ item: serializeCompany(company) });
  })
);

contentRouter.post(
  "/me/tech-seeds",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const companyId = invariant(auth.companyId, "自社に紐づく企業がありません");

    const parsed = techSeedCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw sendZodError(parsed.error);
    }

    const item = await prisma.techSeed.create({
      data: {
        ...parsed.data,
        companyId
      },
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

contentRouter.patch(
  "/me/tech-seeds/:id",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const companyId = invariant(auth.companyId, "自社に紐づく企業がありません");

    const parsed = techSeedPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw sendZodError(parsed.error);
    }

    const existing = invariant(
      await prisma.techSeed.findUnique({
        where: { id: req.params.id }
      }),
      "技術シーズが見つかりません"
    );

    if (existing.companyId !== companyId) {
      forbidden("他社の技術シーズは編集できません");
    }

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

contentRouter.delete(
  "/me/tech-seeds/:id",
  asyncHandler(async (req, res) => {
    const auth = requireAuth(req);
    const companyId = invariant(auth.companyId, "自社に紐づく企業がありません");

    const existing = invariant(
      await prisma.techSeed.findUnique({
        where: { id: req.params.id }
      }),
      "技術シーズが見つかりません"
    );

    if (existing.companyId !== companyId) {
      forbidden("他社の技術シーズは削除できません");
    }

    await prisma.techSeed.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  })
);

contentRouter.get(
  "/admin-bootstrap",
  asyncHandler(async (req, res) => {
    const auth = requireAdmin(req);
    res.json({ ok: true, userId: auth.userId });
  })
);
