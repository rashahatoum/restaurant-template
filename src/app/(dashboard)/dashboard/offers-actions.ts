"use server";

// The dashboard's offers writes with the Laravel API (D7d): the section
// (switch, texts, menu card photo) and the offers list. Called by
// lib/dashboard/api-repository only; same rules as menu-actions (token sent,
// inputs checked before they reach a URL, the public pages refreshed after a save).
//
// Endpoints (API-CONTRACT §2, §4): section → PATCH /admin/offers-section;
// a whole offer from the form → PUT (a missing optional field is cleared);
// on/off from the list → PATCH; move → POST …/move. Confirmed with the
// backend (2026-11-17): the full save is PUT, and the section PATCH answers
// the settings flat (lib/dashboard/section-api).

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isDirection, isObject, segment, type Direction } from "@/lib/dashboard/action-helpers";
import { toOffersSettings } from "@/lib/dashboard/section-api";
import { OFFERS_TAG } from "@/services/content";
import type { Offer } from "@/types/content";
import type { OfferInput, OffersSettings } from "@/types/dashboard";

const offersWrite = <T>(path: string, init: Parameters<typeof adminWrite>[2]) => adminWrite<T>(OFFERS_TAG, path, init);

/** The section fields the dashboard may change, nothing else. */
const SETTINGS_KEYS = ["isEnabled", "eyebrow", "title", "menuCardImage"] as const;

/**
 * Only the fields passed change (PATCH). A photo removed comes as
 * `menuCardImage: undefined`, which JSON would drop: it's sent as `null` (removes it).
 */
export async function updateOffersSettingsAction(changes: Partial<OffersSettings>): Promise<Result<OffersSettings>> {
    if (!isObject(changes)) return badRequest();
    const body = Object.fromEntries(
        SETTINGS_KEYS.filter((key) => key in changes).map((key) => [key, changes[key] ?? null])
    );
    if (Object.keys(body).length === 0) return badRequest();

    const result = await offersWrite<unknown>("/admin/offers-section", { method: "PATCH", body });
    if (!result.ok) return result;
    const saved = toOffersSettings(result.data);
    return saved ? ok(saved) : fail(appError("server"));
}

export async function createOfferAction(input: OfferInput): Promise<Result<Offer>> {
    if (!isObject(input)) return badRequest();
    return offersWrite("/admin/offers", { method: "POST", body: input });
}

/** Whole offer from the form (PUT: a missing badge or imageStyle is cleared). */
export async function saveOfferAction(id: string, input: OfferInput): Promise<Result<Offer>> {
    const slug = segment(id);
    if (!slug || !isObject(input)) return badRequest();
    return offersWrite(`/admin/offers/${slug}`, { method: "PUT", body: input });
}

export async function setOfferActiveAction(id: string, isActive: boolean): Promise<Result<Offer>> {
    const slug = segment(id);
    if (!slug || typeof isActive !== "boolean") return badRequest();
    return offersWrite(`/admin/offers/${slug}`, { method: "PATCH", body: { isActive } });
}

/** Returns the whole list in its new order (API-CONTRACT §4.2). */
export async function moveOfferAction(id: string, direction: Direction): Promise<Result<readonly Offer[]>> {
    const slug = segment(id);
    if (!slug || !isDirection(direction)) return badRequest();
    return offersWrite(`/admin/offers/${slug}/move`, { method: "POST", body: { direction } });
}

export async function deleteOfferAction(id: string): Promise<Result<null>> {
    const slug = segment(id);
    if (!slug) return badRequest();
    return offersWrite(`/admin/offers/${slug}`, { method: "DELETE" });
}
