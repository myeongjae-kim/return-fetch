import { ApiResponse } from "@/app/domain/model/ApiResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const delay = Number(request.nextUrl.searchParams.get("delay")) || 0;

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
  return new Response(
    JSON.stringify({
      status: 200,
      statusText: "OK",
      data: await request.json(),
    } satisfies ApiResponse<object>),
    { status: 200 },
  );
}
