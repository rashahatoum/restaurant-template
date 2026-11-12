import { LOGIN_PATH, safeDashboardPath } from "@/lib/auth/paths";
import { SESSION_COOKIE } from "@/lib/auth/session-token";
import { NextResponse, type NextRequest } from "next/server";

// The API answered 401 (token expired or revoked, e.g. after a password
// change) while the cookie still looks valid. A page can't delete a cookie,
// and the proxy would send the login page straight back to the dashboard, so
// this route clears the cookie first, then opens the login with `next`.
export function GET(request: NextRequest) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    const next = safeDashboardPath(request.nextUrl.searchParams.get("next"));
    loginUrl.searchParams.set("next", next);

    // Deleted on the redirect response itself, so the browser gets both together
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete({ name: SESSION_COOKIE, path: "/dashboard" });
    return response;
}
