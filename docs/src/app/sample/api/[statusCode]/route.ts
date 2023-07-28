import { ApiResponse } from "@/app/domain/model/ApiResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const status = Number(request.nextUrl.pathname.split("/").pop());

  return new Response(
    JSON.stringify({
      status,
      statusText: "You already know what it is.",
      data: null,
    } satisfies ApiResponse<null>),
    { status },
  );
}
