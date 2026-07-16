import { NextRequest } from "next/server";
import returnFetch from "return-fetch";

const pathPrefix = "/sample/api/proxy/echo/nextjs-fetch";

async function proxy(request: NextRequest) {
  const { nextUrl, method, headers } = request;
  const fetch = returnFetch({ baseUrl: `${nextUrl.origin}/sample/api/echo/` });
  const path = nextUrl.pathname.replace(`${pathPrefix}/`, "");
  const response = await fetch(`${path}${nextUrl.search}`, {
    method,
    headers,
    body: request.body,
    // @ts-expect-error -- duplex is supported by Node.js fetch but missing from RequestInit.
    duplex: "half",
  });

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
