"use server";

import { apiFetch } from "@/lib/api/client";
import { appError, type AppError } from "@/lib/api/errors";
import { clearFailures, isLocked, recordFailure } from "@/lib/auth/login-attempts";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { safeDashboardPath } from "@/lib/auth/paths";
import { authenticate } from "@/services/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface LoginState {
    error?: AppError;
    /** Typed username, kept so a failed attempt doesn't clear it. */
    username?: string;
}

async function clientIp() {
    const forwarded = (await headers()).get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const ip = await clientIp();
    const now = Date.now();

    // A first, in-memory layer; with the API on, Laravel counts per browser too
    if (isLocked(ip, now)) {
        return { username, error: appError("rate_limited") };
    }

    const result = await authenticate(username, password, { clientIp: ip === "unknown" ? undefined : ip });
    if (!result.ok) {
        if (result.error.kind === "validation") recordFailure(ip, now);
        return { username, error: result.error };
    }

    clearFailures(ip);
    await createSession(result.data.name, result.data.token);
    // Back to the page that asked for the login (only dashboard paths)
    redirect(safeDashboardPath(formData.get("next")));
}

export async function logout() {
    // Delete the token on the server first: without this it stays valid for
    // up to 7 days. If the API can't be reached, sign out here anyway.
    if ((await getSession())?.token) await apiFetch("/auth/logout", { method: "POST", auth: true });
    await deleteSession();
    redirect("/dashboard/login");
}
