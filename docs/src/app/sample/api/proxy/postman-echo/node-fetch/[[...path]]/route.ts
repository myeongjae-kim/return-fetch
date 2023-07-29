import { NextRequest } from "next/server";
import nodeFetch from "node-fetch";
import returnFetch, { ReturnFetchDefaultOptions } from "return-fetch";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const pathPrefix = "/sample/api/proxy/postman-echo/node-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    fetch: nodeFetch as ReturnFetchDefaultOptions["fetch"],
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
