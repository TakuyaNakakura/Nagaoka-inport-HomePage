import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const PROXY_ERROR_MESSAGE = "API proxy is not configured correctly.";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const resolveProxyBaseUrl = () => {
  const configuredBaseUrl = process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configuredBaseUrl || !ABSOLUTE_URL_PATTERN.test(configuredBaseUrl)) {
    throw new Error(PROXY_ERROR_MESSAGE);
  }

  return configuredBaseUrl;
};

const buildTargetUrl = (path: string[], search: string) => {
  const baseUrl = resolveProxyBaseUrl();
  const targetUrl = new URL(path.join("/"), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  targetUrl.search = search;
  return targetUrl;
};

const buildProxyRequestHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);

  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("host");

  return headers;
};

const buildProxyResponseHeaders = (response: Response) => {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }

    headers.set(key, value);
  });

  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie") as string]
        : [];

  for (const value of setCookies) {
    headers.append("set-cookie", value);
  }

  return headers;
};

const proxyRequest = async (request: NextRequest, context: RouteContext) => {
  try {
    const { path } = await context.params;
    const requestBody =
      request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
    const targetUrl = buildTargetUrl(path, request.nextUrl.search);
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: buildProxyRequestHeaders(request),
      body: requestBody,
      cache: "no-store",
      redirect: "manual"
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: buildProxyResponseHeaders(response)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reach backend API.";
    return Response.json({ message }, { status: 502 });
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;
