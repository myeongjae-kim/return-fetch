import { NextRequest } from "next/server";
import returnFetch from "return-fetch";

const pathPrefix = "/sample/api/proxy/echo/nextjs-fetch";

async function proxy(request: NextRequest) {
  const { nextUrl, method, headers } = request;
  const fetch = returnFetch({ baseUrl: nextUrl.origin });
  const path = "/sample/api/echo/" + nextUrl.pathname.replace(`${pathPrefix}/`, "");
  const response = await fetch(`${path}${nextUrl.search}`, {
    method,
    headers,
    body: request.body,
    // @ts-expect-error -- duplex is supported by Node.js fetch but missing from RequestInit.
    duplex: "half",
  });
  const body = await response.arrayBuffer();
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
