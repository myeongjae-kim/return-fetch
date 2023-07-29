import { NextRequest } from "next/server";
import crossFetch from "cross-fetch";
import returnFetch from "return-fetch";

const pathPrefix = "/sample/api/proxy/postman-echo/cross-fetch";

export async function GET(request: NextRequest) {
  const { nextUrl, method, headers } = request;

  const fetch = returnFetch({
    fetch: crossFetch,
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
