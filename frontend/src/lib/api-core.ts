export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeRelativeBaseUrl = (baseUrl: string) => {
  if (!baseUrl) {
    return "";
  }

  const withLeadingSlash = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
};

export const createUrl = (
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | undefined>
) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = isAbsoluteUrl(baseUrl)
    ? new URL(normalizedPath, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`)
    : new URL(`${normalizeRelativeBaseUrl(baseUrl)}${normalizedPath}`, "http://localhost");

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return isAbsoluteUrl(baseUrl) ? url.toString() : `${url.pathname}${url.search}`;
};

export const parseResponse = async <T>(response: Response) => {
  if (response.status === 204) {
    return null as T;
  }

  const data = (await response.json()) as T | { message?: string };

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data ? data.message ?? "API error" : "API error";

    throw new ApiError(response.status, message);
  }

  return data as T;
};
