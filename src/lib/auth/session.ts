import "server-only";

// The dashboard login cookie, server side. The proxy does a quick check on
// every /dashboard request; the dashboard layout checks again with getSession().

import { SESSION_COOKIE, signSession, verifySession, type SessionPayload } from "@/lib/auth/session-token";
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

export async function createSession(name: string) {
    const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
    const token = await signSession({ name, exp }, getSessionSecret());

    (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        // Only the dashboard needs it; the public site never sends it
        path: "/dashboard",
        expires: new Date(exp),
    });
}

/** The signed-in user, or null. */
export async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return verifySession(token, getSessionSecret(), Date.now());
}

export async function deleteSession() {
    (await cookies()).delete({ name: SESSION_COOKIE, path: "/dashboard" });
}
