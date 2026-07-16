import { NextRequest } from "next/server";
import nodeFetch from "node-fetch";
import returnFetch, { ReturnFetchDefaultOptions } from "return-fetch";

const pathPrefix = "/sample/api/proxy/echo/node-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;
  const fetch = returnFetch({
    fetch: nodeFetch as unknown as ReturnFetchDefaultOptions["fetch"],
    baseUrl: nextUrl.origin,
  });
  const path = "/sample/api/echo/" + nextUrl.pathname.replace(`${pathPrefix}/`, "");
  const response = await fetch(`${path}${nextUrl.search}`, { method, headers });

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}
