import { NextRequest } from "next/server";
import crossFetch from "cross-fetch";
import returnFetch from "return-fetch";

const pathPrefix = "/sample/api/proxy/echo/cross-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;
  const fetch = returnFetch({ fetch: crossFetch, baseUrl: `${nextUrl.origin}/sample/api/echo/` });
  const path = nextUrl.pathname.replace(`${pathPrefix}/`, "");
  const response = await fetch(`${path}${nextUrl.search}`, { method, headers });

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}
