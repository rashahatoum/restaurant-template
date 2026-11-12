import "server-only";

// The only way this app calls the Laravel API (DASHBOARD_PLAN §5.1). Server
// only: the base URL, the frontend key and the login token never reach the
// browser. Every failure comes back as an AppError (API-CONTRACT §5), so
// callers handle one Result shape.

import { appError, fail, fromHttpResponse, ok, type Result } from "@/lib/api/errors";
import { getSession } from "@/lib/auth/session";

/** A request to Vercel → Hostinger that takes longer than this is given up. */
const TIMEOUT_MS = 10_000;

export interface ApiFetchOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** A plain object is sent as JSON; FormData as multipart (uploads). */
    body?: unknown;
    /** Send the signed-in user's token (every /admin and /auth call but login). */
    auth?: boolean;
    /** The browser's IP, sent on login only (API-CONTRACT §4 Auth). */
    clientIp?: string;
    /** Next.js caching for public reads (D7b); omitted = not cached. */
    next?: { tags?: string[]; revalidate?: number };
}

/** The server couldn't reach the API: not the owner's internet, so not "offline". */
const unreachable = () => appError("server", { message: "ما قدرنا نوصل للسيرفر، جرّب كمان شوي" });

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<Result<T>> {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) return fail(appError("server", { message: "السيرفر مش مضبوط (API_BASE_URL)" }));

    const headers = new Headers({ Accept: "application/json", "Accept-Language": "ar" });
    const key = process.env.FRONTEND_API_KEY;
    if (key) headers.set("X-Frontend-Key", key);
    if (options.clientIp) headers.set("X-Client-IP", options.clientIp);

    if (options.auth) {
        const token = (await getSession())?.token;
        if (!token) return fail(appError("unauthenticated"));
        headers.set("Authorization", `Bearer ${token}`);
    }

    let body: BodyInit | undefined;
    if (options.body instanceof FormData) {
        // fetch sets the multipart boundary itself
        body = options.body;
    } else if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
        response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
            method: options.method ?? "GET",
            headers,
            body,
            signal: AbortSignal.timeout(TIMEOUT_MS),
            ...(options.next ? { next: options.next } : { cache: "no-store" as const }),
        });
    } catch (error) {
        return fail(error instanceof DOMException && error.name === "TimeoutError" ? appError("timeout") : unreachable());
    }

    if (response.status === 204) return ok(undefined as T);

    const data: unknown = await response.json().catch(() => undefined);
    if (!response.ok) return fail(fromHttpResponse(response.status, data));
    // A 2xx that isn't JSON means a proxy or an error page answered, not Laravel
    return data === undefined ? fail(unreachable()) : ok(data as T);
}
