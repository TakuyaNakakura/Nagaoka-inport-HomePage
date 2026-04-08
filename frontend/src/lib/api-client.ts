import { ApiError, createUrl, parseResponse } from "./api-core";

const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export { ApiError };

export const clientApiFetch = async <T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined>
) => {
  const response = await fetch(createUrl(publicApiBaseUrl, path, query), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  return parseResponse<T>(response);
};
