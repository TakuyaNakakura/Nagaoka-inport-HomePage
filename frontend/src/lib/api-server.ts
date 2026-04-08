import "server-only";

import { cookies } from "next/headers";
import { ApiError, createUrl, parseResponse } from "./api-core";
import type {
  ActivityReport,
  Center,
  Company,
  DashboardData,
  News,
  PaginatedResponse,
  ReferenceData,
  SitePage,
  SupportProject,
  TechSeed,
  User
} from "./types";

const internalApiBaseUrl =
  process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export { ApiError };

export const serverApiFetch = async <T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined>
) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(createUrl(internalApiBaseUrl, path, query), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(init?.headers ?? {})
    }
  });

  return parseResponse<T>(response);
};

export const getCurrentUser = async () => {
  try {
    const data = await serverApiFetch<{ user: User }>("/auth/me");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
};

export const fetchDashboard = () => serverApiFetch<DashboardData>("/dashboard");
export const fetchNewsList = (query?: Record<string, string | number | undefined>) =>
  serverApiFetch<PaginatedResponse<News>>("/news", undefined, query);
export const fetchNews = (id: string) => serverApiFetch<{ item: News }>(`/news/${id}`);
export const fetchCenters = () => serverApiFetch<{ items: Center[] }>("/centers");
export const fetchCenter = (id: string) => serverApiFetch<{ item: Center }>(`/centers/${id}`);
export const fetchActivityReports = (query?: Record<string, string | number | undefined>) =>
  serverApiFetch<PaginatedResponse<ActivityReport>>("/activity-reports", undefined, query);
export const fetchActivityReport = (id: string) =>
  serverApiFetch<{ item: ActivityReport }>(`/activity-reports/${id}`);
export const fetchSupportProjects = (query?: Record<string, string | number | undefined>) =>
  serverApiFetch<PaginatedResponse<SupportProject>>("/support-projects", undefined, query);
export const fetchSupportProject = (id: string) =>
  serverApiFetch<{ item: SupportProject }>(`/support-projects/${id}`);
export const fetchCompanies = (query?: Record<string, string | number | undefined>) =>
  serverApiFetch<PaginatedResponse<Company>>("/companies", undefined, query);
export const fetchCompany = (id: string) => serverApiFetch<{ item: Company }>(`/companies/${id}`);
export const fetchTechSeeds = (query?: Record<string, string | number | undefined>) =>
  serverApiFetch<PaginatedResponse<TechSeed>>("/tech-seeds", undefined, query);
export const fetchTechSeed = (id: string) => serverApiFetch<{ item: TechSeed }>(`/tech-seeds/${id}`);
export const fetchAbout = () => serverApiFetch<{ item: SitePage }>("/site-pages/about");
export const fetchAdminReferences = () => serverApiFetch<ReferenceData>("/admin/reference-data");
