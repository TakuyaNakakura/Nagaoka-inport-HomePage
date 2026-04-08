export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const createUrl = (
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | undefined>
) => {
  const url = new URL(path, baseUrl);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
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
