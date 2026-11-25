import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_PATH } from "@/lib/account/loginPath";
import { SESSION_COOKIE } from "@/server/core/cookie";

/**
 * Sends visitors with no session cookie to their portal's login, keeping where they were going.
 * Only a quick first check: layouts, pages and actions verify the session against the database.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const role = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/teacher")
      ? "teacher"
      : "student";
  const login = LOGIN_PATH[role];
  if (pathname === login || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = new URL(login, request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"] };
