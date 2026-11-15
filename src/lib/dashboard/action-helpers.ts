import "server-only";

// Shared by the dashboard's Server Actions (menu, offers…): input checks
// before anything reaches a URL, and the "write, then refresh" step.

import { apiFetch } from "@/lib/api/client";
import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { refresh, updateTag } from "next/cache";

export type Direction = "up" | "down";

export const badRequest = <T>(): Result<T> => fail(appError("validation", { message: "طلب ناقص، حدّث الصفحة وجرّب مرة تانية" }));

/** A slug or id as one URL segment (never a path of its own). */
export const segment = (id: unknown) => (typeof id === "string" && id.length > 0 ? encodeURIComponent(id) : null);

export const isDirection = (value: unknown): value is Direction => value === "up" || value === "down";

export const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Runs a dashboard write with the user's token; on success refreshes the
 * public pages that read `tags` (the owner sees her change on the site right
 * away) and re-renders this dashboard page with fresh data. A 204 becomes `null`.
 */
export async function adminWrite<T>(tags: string | readonly string[], path: string, init: Parameters<typeof apiFetch>[1]): Promise<Result<T>> {
    const result = await apiFetch<T>(path, { ...init, auth: true });
    if (!result.ok) return result;
    for (const tag of typeof tags === "string" ? [tags] : tags) updateTag(tag);
    refresh();
    return ok((result.data ?? null) as T);
}
