import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { logHttp } from "@/lib/logger";

export async function withHttpLogging(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const start = Date.now();
  try {
    const result = await handler();
    logHttp(request.method, request.url, result.status, Date.now() - start);
    return result;
  } catch (error) {
    logHttp(request.method, request.url, 500, Date.now() - start);
    throw error;
  }
}
