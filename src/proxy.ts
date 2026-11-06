// Next.js 16 "proxy" (formerly middleware): a fast cookie check before any
// /dashboard page. Signed out → login (remembering the page); signed in and on
// the login page → dashboard. The dashboard layout checks the session again.

import { DASHBOARD_HOME, LOGIN_PATH } from "@/lib/auth/paths";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session-token";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const secret = process.env.SESSION_SECRET ?? "";
    const session =
        secret.length >= 32
            ? await verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret, Date.now())
            : null;

    const isLogin = pathname === LOGIN_PATH;

    if (isLogin && session) {
        return NextResponse.redirect(new URL(DASHBOARD_HOME, request.url));
    }

    if (!isLogin && !session) {
        const loginUrl = new URL(LOGIN_PATH, request.url);
        loginUrl.searchParams.set("next", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/:path*"],
};
