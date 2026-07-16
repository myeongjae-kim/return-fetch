import { NextRequest } from "next/server";

const hiddenHeaders = new Set([
  "authorization",
  "cookie",
  "forwarded",
  "x-invocation-id",
  "x-matched-path",
  "x-real-ip",
]);

function toObject(values: URLSearchParams): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of values) {
    const current = result[key];
    result[key] = current === undefined ? value : Array.isArray(current) ? [...current, value] : [current, value];
  }

  return result;
}

function publicHeaders(headers: Headers): Record<string, string> {
  return Object.fromEntries(
    [...headers].filter(([name]) => {
      const normalizedName = name.toLowerCase();
      return !(
        hiddenHeaders.has(normalizedName) ||
        normalizedName.startsWith("x-forwarded-") ||
        normalizedName.startsWith("x-vercel-")
      );
    }),
  );
}

async function echo(request: NextRequest): Promise<Response> {
  const headers = publicHeaders(request.headers);
  const args = toObject(request.nextUrl.searchParams);
  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "";
  let json: unknown = null;
  let form: Record<string, string | string[]> = {};

  if (body && contentType.includes("application/json")) {
    try {
      json = JSON.parse(body);
    } catch {
      // Keep invalid JSON available in `data`, as an echo service should.
    }
  }

  if (body && contentType.includes("application/x-www-form-urlencoded")) {
    form = toObject(new URLSearchParams(body));
  }

  return Response.json({
    args,
    data: body,
    files: {},
    form,
    headers,
    json,
    method: request.method,
    url: request.url,
  });
}

async function post(request: NextRequest): Promise<Response> {
  if (request.nextUrl.pathname !== "/sample/api/echo") {
    return echo(request);
  }

  const delay = Number(request.nextUrl.searchParams.get("delay")) || 0;
  await new Promise<void>((resolve) => setTimeout(resolve, delay));

  return Response.json({
    status: 200,
    statusText: "OK",
    data: await request.json(),
  });
}

export const dynamic = "force-dynamic";

export const GET = echo;
export const POST = post;
export const PUT = echo;
export const PATCH = echo;
export const DELETE = echo;
export const HEAD = echo;
export const OPTIONS = echo;
