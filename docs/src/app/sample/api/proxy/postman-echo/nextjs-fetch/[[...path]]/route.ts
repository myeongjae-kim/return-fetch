import { NextRequest } from "next/server";
import returnFetch from "return-fetch";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const pathPrefix = "/sample/api/proxy/postman-echo/nextjs-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    baseUrl: "https://postman-echo.com",
  });

  const response = await fetch(nextUrl.pathname.replace(pathPrefix, ""), {
    method,
    headers,
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function POST(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    baseUrl: "https://postman-echo.com",
  });

  const response = await fetch(nextUrl.pathname.replace(pathPrefix, ""), {
    method,
    headers,
    body: request.body,
    // @ts-ignore
    duplex: "half",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
