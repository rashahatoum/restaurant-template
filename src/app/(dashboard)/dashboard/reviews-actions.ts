"use server";

// The dashboard's reviews writes with the Laravel API (D7f): the section
// (switch, texts, default question) and the reviews list. Called by
// lib/dashboard/api-repository only; same rules as offers-actions. Endpoints
// (API-CONTRACT §2, §4): section → PATCH /admin/reviews-section; a whole review
// from the form → PUT; shown/hidden → PATCH; move → POST …/move. Confirmed with
// the backend (2026-11-17): PUT for the full save, the section PATCH answers the
// settings flat (lib/dashboard/section-api).

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isDirection, isObject, segment, type Direction } from "@/lib/dashboard/action-helpers";
import { toReviewsSettings } from "@/lib/dashboard/section-api";
import { REVIEWS_TAG } from "@/services/content";
import type { Review } from "@/types/content";
import type { ReviewInput, ReviewsSettings } from "@/types/dashboard";

const reviewsWrite = <T>(path: string, init: Parameters<typeof adminWrite>[2]) => adminWrite<T>(REVIEWS_TAG, path, init);

/** The section fields the dashboard may change, nothing else. */
const SETTINGS_KEYS = ["isEnabled", "eyebrow", "title", "defaultQuestion"] as const;

/** Only the fields passed change (PATCH). */
export async function updateReviewsSettingsAction(changes: Partial<ReviewsSettings>): Promise<Result<ReviewsSettings>> {
    if (!isObject(changes)) return badRequest();
    const body = Object.fromEntries(SETTINGS_KEYS.filter((key) => changes[key] !== undefined).map((key) => [key, changes[key]]));
    if (Object.keys(body).length === 0) return badRequest();

    const result = await reviewsWrite<unknown>("/admin/reviews-section", { method: "PATCH", body });
    if (!result.ok) return result;
    const saved = toReviewsSettings(result.data);
    return saved ? ok(saved) : fail(appError("server"));
}

export async function createReviewAction(input: ReviewInput): Promise<Result<Review>> {
    if (!isObject(input)) return badRequest();
    return reviewsWrite("/admin/reviews", { method: "POST", body: input });
}

/** Whole review from the form (PUT: a missing question or time is cleared). */
export async function saveReviewAction(id: string, input: ReviewInput): Promise<Result<Review>> {
    const slug = segment(id);
    if (!slug || !isObject(input)) return badRequest();
    return reviewsWrite(`/admin/reviews/${slug}`, { method: "PUT", body: input });
}

export async function setReviewVisibleAction(id: string, isVisible: boolean): Promise<Result<Review>> {
    const slug = segment(id);
    if (!slug || typeof isVisible !== "boolean") return badRequest();
    return reviewsWrite(`/admin/reviews/${slug}`, { method: "PATCH", body: { isVisible } });
}

/** Returns the whole list in its new order (API-CONTRACT §4.2). */
export async function moveReviewAction(id: string, direction: Direction): Promise<Result<readonly Review[]>> {
    const slug = segment(id);
    if (!slug || !isDirection(direction)) return badRequest();
    return reviewsWrite(`/admin/reviews/${slug}/move`, { method: "POST", body: { direction } });
}

export async function deleteReviewAction(id: string): Promise<Result<null>> {
    const slug = segment(id);
    if (!slug) return badRequest();
    return reviewsWrite(`/admin/reviews/${slug}`, { method: "DELETE" });
}
