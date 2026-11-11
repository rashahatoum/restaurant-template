import "server-only";

// The dashboard login cookie, server side. The proxy does a quick check on
// every /dashboard request; the dashboard layout checks again with getSession().

import { isApiEnabled } from "@/lib/api/config";
import {
    SESSION_COOKIE,
    signSession,
    usableSession,
    verifySession,
    type SessionPayload,
} from "@/lib/auth/session-token";
import { cookies } from "next/headers";

/** How long a login lasts on a device (owner: 7 days). */
export const SESSION_DAYS = 7;

/** Throws a clear error when the secret is missing, instead of signing with nothing. */
export function getSessionSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("SESSION_SECRET is missing or shorter than 32 characters (see .env.example).");
    }
    return secret;
}

/** `apiToken`: the Laravel token when the login went through the API. */
export async function createSession(name: string, apiToken?: string) {
    // Same 7 days as the Laravel token; a token revoked earlier shows up as a 401
    const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
    const value = await signSession({ name, exp, ...(apiToken ? { token: apiToken } : {}) }, getSessionSecret());

    (await cookies()).set(SESSION_COOKIE, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // Only the dashboard needs it; the public site never sends it
        path: "/dashboard",
        expires: new Date(exp),
    });
}

/**
 * The signed-in user, or null. Trusts the cookie until it expires (D7a
 * decision 2): no API call per page; a revoked token comes back as a 401,
 * which sends the user through /dashboard/session-expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
    const value = (await cookies()).get(SESSION_COOKIE)?.value;
    return usableSession(await verifySession(value, getSessionSecret(), Date.now()), isApiEnabled());
}

export async function deleteSession() {
    (await cookies()).delete({ name: SESSION_COOKIE, path: "/dashboard" });
}
