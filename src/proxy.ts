import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers are set in next.config.ts via headers().
// Use this file for auth checks, redirects, and other dynamic per-request logic.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
