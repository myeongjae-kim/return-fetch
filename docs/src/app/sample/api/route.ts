import { ApiResponse } from "@/app/domain/model/ApiResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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
      data: { message: "Hello, world!" },
    } satisfies ApiResponse<{ message: string }>),
    { status: 200 },
  );
}
