import {
  PublishStatus,
  Role,
  SitePageKey,
  UserStatus,
  type ActivityReport,
  type Center,
  type Company,
  type News,
  type SitePage,
  type SupportProject,
  type TechSeed,
  type User
} from "@prisma/client";

export const toPublishStatus = (value: PublishStatus) =>
  value === PublishStatus.PUBLISHED ? "published" : "draft";

export const toRole = (value: Role) => (value === Role.ADMIN ? "admin" : "member");

export const toUserStatus = (value: UserStatus) =>
  value === UserStatus.ACTIVE ? "active" : "disabled";

export const serializeUser = (
  user: User & { company?: Pick<Company, "id" | "companyName"> | null }
) => ({
  id: user.id,
  loginId: user.loginId,
  email: user.email,
  userName: user.userName,
  role: toRole(user.role),
  status: toUserStatus(user.status),
  companyId: user.companyId,
  companyName: user.company?.companyName ?? null,
  mustChangePassword: user.mustChangePassword,
  lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});

export const serializeCompany = (
  company: Company & { techSeeds?: TechSeed[]; users?: User[] }
) => ({
  id: company.id,
  companyName: company.companyName,
  industry: company.industry,
  address: company.address,
  businessSummary: company.businessSummary,
  interestTheme: company.interestTheme,
  contactInfo: company.contactInfo,
  isActive: company.isActive,
  createdAt: company.createdAt.toISOString(),
  updatedAt: company.updatedAt.toISOString(),
  techSeeds:
    company.techSeeds?.map((techSeed) => serializeTechSeed({ ...techSeed, company })) ?? undefined,
  userCount: company.users?.length
});

export const serializeTechSeed = (
  techSeed: TechSeed & { company?: Pick<Company, "id" | "companyName" | "industry"> }
) => ({
  id: techSeed.id,
  companyId: techSeed.companyId,
  company: techSeed.company
    ? {
        id: techSeed.company.id,
        companyName: techSeed.company.companyName,
        industry: techSeed.company.industry
      }
    : undefined,
  seedName: techSeed.seedName,
  seedSummary: techSeed.seedSummary,
  applicationField: techSeed.applicationField,
  usageExample: techSeed.usageExample,
  strength: techSeed.strength,
  relatedResults: techSeed.relatedResults,
  collaborationTheme: techSeed.collaborationTheme,
  createdAt: techSeed.createdAt.toISOString(),
  updatedAt: techSeed.updatedAt.toISOString()
});

export const serializeNews = (news: News) => ({
  id: news.id,
  title: news.title,
  body: news.body,
  category: news.category,
  publishStatus: toPublishStatus(news.publishStatus),
  publishedAt: news.publishedAt?.toISOString() ?? null,
  createdBy: news.createdBy,
  updatedBy: news.updatedBy,
  createdAt: news.createdAt.toISOString(),
  updatedAt: news.updatedAt.toISOString()
});

export const serializeCenter = (
  center: Center & {
    reportRelations?: { activityReport: ActivityReport }[];
    projectRelations?: { supportProject: SupportProject }[];
  }
) => ({
  id: center.id,
  centerName: center.centerName,
  domain: center.domain,
  summary: center.summary,
  mainActivities: center.mainActivities,
  companyRelation: center.companyRelation,
  createdAt: center.createdAt.toISOString(),
  updatedAt: center.updatedAt.toISOString(),
  relatedReports:
    center.reportRelations?.map((relation) => serializeActivityReport(relation.activityReport)) ??
    undefined,
  relatedProjects:
    center.projectRelations?.map((relation) => serializeSupportProject(relation.supportProject)) ??
    undefined
});

export const serializeActivityReport = (
  report: ActivityReport & {
    centerRelations?: { center: Center }[];
    projectRelations?: { supportProject: SupportProject }[];
  }
) => ({
  id: report.id,
  title: report.title,
  summary: report.summary,
  body: report.body,
  category: report.category,
  publishStatus: toPublishStatus(report.publishStatus),
  publishedAt: report.publishedAt?.toISOString() ?? null,
  createdBy: report.createdBy,
  updatedBy: report.updatedBy,
  createdAt: report.createdAt.toISOString(),
  updatedAt: report.updatedAt.toISOString(),
  centerIds: report.centerRelations?.map((relation) => relation.center.id) ?? [],
  projectIds: report.projectRelations?.map((relation) => relation.supportProject.id) ?? [],
  centers:
    report.centerRelations?.map((relation) => ({
      id: relation.center.id,
      centerName: relation.center.centerName,
      domain: relation.center.domain
    })) ?? undefined,
  relatedProjects:
    report.projectRelations?.map((relation) => ({
      id: relation.supportProject.id,
      projectName: relation.supportProject.projectName
    })) ?? undefined
});

export const serializeSupportProject = (
  project: SupportProject & {
    centerRelations?: { center: Center }[];
    reportRelations?: { activityReport: ActivityReport }[];
  }
) => ({
  id: project.id,
  projectName: project.projectName,
  summary: project.summary,
  background: project.background,
  issue: project.issue,
  goal: project.goal,
  supportNeeded: project.supportNeeded,
  expectedResult: project.expectedResult,
  contactInfo: project.contactInfo,
  publishStatus: toPublishStatus(project.publishStatus),
  publishedAt: project.publishedAt?.toISOString() ?? null,
  createdBy: project.createdBy,
  updatedBy: project.updatedBy,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
  centerIds: project.centerRelations?.map((relation) => relation.center.id) ?? [],
  reportIds: project.reportRelations?.map((relation) => relation.activityReport.id) ?? [],
  centers:
    project.centerRelations?.map((relation) => ({
      id: relation.center.id,
      centerName: relation.center.centerName,
      domain: relation.center.domain
    })) ?? undefined,
  relatedReports:
    project.reportRelations?.map((relation) => ({
      id: relation.activityReport.id,
      title: relation.activityReport.title
    })) ?? undefined
});

export const serializeSitePage = (page: SitePage) => ({
  id: page.id,
  pageKey: page.pageKey === SitePageKey.ABOUT_TERMS ? "about_terms" : page.pageKey,
  title: page.title,
  body: page.body,
  updatedBy: page.updatedBy,
  createdAt: page.createdAt.toISOString(),
  updatedAt: page.updatedAt.toISOString()
});

export const withPagination = <T>(items: T[], total: number, page: number, pageSize: number) => ({
  items,
  meta: {
    page,
    pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize))
  }
});
