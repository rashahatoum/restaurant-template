import "server-only";

// Dashboard sign-in. Today: one account from server env vars. Later: the
// Laravel login endpoint, behind the same signature (API-CONTRACT §4), so the
// login action and screen don't change.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { createHash, timingSafeEqual } from "node:crypto";

export interface SignedInUser {
    name: string;
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

export async function authenticate(username: string, password: string): Promise<Result<SignedInUser>> {
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
