export type Role = "admin" | "member";
export type UserStatus = "active" | "disabled";
export type PublishStatus = "draft" | "published";

export type OptionItem = {
  id: string;
  label: string;
};

export type User = {
  id: string;
  loginId: string;
  email: string;
  userName: string;
  role: Role;
  status: UserStatus;
  companyId: string | null;
  companyName: string | null;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  id: string;
  companyName: string;
  industry: string;
  address: string | null;
  businessSummary: string | null;
  interestTheme: string | null;
  contactInfo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  techSeeds?: TechSeed[];
};

export type TechSeed = {
  id: string;
  companyId: string;
  company?: {
    id: string;
    companyName: string;
    industry: string;
  };
  seedName: string;
  seedSummary: string;
  applicationField: string | null;
  usageExample: string | null;
  strength: string | null;
  relatedResults: string | null;
  collaborationTheme: string | null;
  createdAt: string;
  updatedAt: string;
};

export type News = {
  id: string;
  title: string;
  body: string;
  category: string;
  publishStatus: PublishStatus;
  publishedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Center = {
  id: string;
  centerName: string;
  domain: string;
  summary: string;
  mainActivities: string;
  companyRelation: string | null;
  createdAt: string;
  updatedAt: string;
  relatedReports?: ActivityReport[];
  relatedProjects?: SupportProject[];
};

export type ActivityReport = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string | null;
  publishStatus: PublishStatus;
  publishedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  centerIds?: string[];
  projectIds?: string[];
  centers?: { id: string; centerName: string; domain: string }[];
  relatedProjects?: { id: string; projectName: string }[];
};

export type SupportProject = {
  id: string;
  projectName: string;
  summary: string;
  background: string;
  issue: string;
  goal: string;
  supportNeeded: string;
  expectedResult: string | null;
  contactInfo: string | null;
  publishStatus: PublishStatus;
  publishedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  centerIds?: string[];
  reportIds?: string[];
  centers?: { id: string; centerName: string; domain: string }[];
  relatedReports?: { id: string; title: string }[];
};

export type SitePage = {
  id: string;
  pageKey: string;
  title: string;
  body: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardData = {
  news: News[];
  centers: Center[];
  activityReports: ActivityReport[];
  supportProjects: SupportProject[];
  companyUpdates: Company[];
  techSeedUpdates: TechSeed[];
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};

export type ReferenceData = {
  centers: OptionItem[];
  companies: OptionItem[];
  supportProjects: OptionItem[];
  activityReports: OptionItem[];
};

