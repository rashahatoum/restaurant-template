import "server-only";

// Dashboard sign-in, one signature for both modes so the login action and
// screen don't change: with API_BASE_URL set, the Laravel login endpoint
// (API-CONTRACT §4 Auth); unset, one account from server env vars.

import { apiFetch } from "@/lib/api/client";
import { isApiEnabled } from "@/lib/api/config";
import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { createHash, timingSafeEqual } from "node:crypto";

export interface SignedInUser {
    name: string;
    /** The Laravel token (7 days); only when the login went through the API. */
    token?: string;
}

interface LoginResponse {
    token: string;
    user: { name: string };
}

async function authenticateWithApi(username: string, password: string, clientIp?: string): Promise<Result<SignedInUser>> {
    const result = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { username, password },
        clientIp,
    });

    if (!result.ok) {
        if (result.error.kind !== "validation") return result;
        // The screen shows one message (no per-field errors): the API's own
        // Arabic text, the same «اسم المستخدم أو كلمة السر غلط» as below
        const first = Object.values(result.error.fieldErrors ?? {})[0]?.[0];
        return fail(appError("validation", { message: first ?? WRONG_CREDENTIALS, status: result.error.status }));
    }

    const { token, user } = result.data;
    if (typeof token !== "string" || !token || typeof user?.name !== "string") return fail(appError("server"));
    return ok({ name: user.name, token });
}

/** Shown for any wrong username/password: never says which one. */
export const WRONG_CREDENTIALS = "اسم المستخدم أو كلمة السر غلط";

/** Trims and collapses spaces, so "نورس  رشيد " still matches. */
export function normalizeUsername(value: string): string {
    return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

/** Constant-time compare (hashing first makes the lengths equal). */
function sameText(a: string, b: string): boolean {
    const hash = (text: string) => createHash("sha256").update(text).digest();
    return timingSafeEqual(hash(a), hash(b));
}

/** `clientIp`: the browser's IP, so the API counts failed tries per browser. */
export async function authenticate(
    username: string,
    password: string,
    { clientIp }: { clientIp?: string } = {}
): Promise<Result<SignedInUser>> {
    if (isApiEnabled()) return authenticateWithApi(username, password, clientIp);

    const expectedUser = process.env.DASHBOARD_USERNAME;
    const expectedPassword = process.env.DASHBOARD_PASSWORD;
    if (!expectedUser || !expectedPassword) {
        // A deployment without the account configured: say so plainly
        return fail(appError("server", { message: "حساب لوحة التحكم مش مضبوط على السيرفر" }));
    }

    const name = normalizeUsername(username);
    // Both compared every time, so the timing doesn't reveal which one was wrong
    const isUser = sameText(name, normalizeUsername(expectedUser));
    const isPassword = sameText(password, expectedPassword);

    return isUser && isPassword ? ok({ name }) : fail(appError("validation", { message: WRONG_CREDENTIALS }));
}
