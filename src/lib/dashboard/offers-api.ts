// The offers JSON from the Laravel API → our types, pure. The contract lists
// `GET /admin/offers` and `PATCH /admin/offers-section` without the exact
// response shape (API-CONTRACT §4), so both likely shapes are read:
//   { isEnabled, eyebrow, title, menuCardImage?, offers: [...] }
//   { section: { isEnabled, eyebrow, title, menuCardImage? }, offers: [...] }
// Anything else fails loudly (better than an empty offers screen).
// To confirm on staging, then keep only the real one.

import type { Offer, OffersContent } from "@/types/content";
import type { OffersSettings } from "@/types/dashboard";

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/** The section's own settings from either shape; null when they aren't there. */
export function toOffersSettings(raw: unknown): OffersSettings | null {
    const section = isObject(raw) && isObject(raw.section) ? raw.section : raw;
    if (!isObject(section) || typeof section.isEnabled !== "boolean") return null;
    return {
        isEnabled: section.isEnabled,
        eyebrow: typeof section.eyebrow === "string" ? section.eyebrow : "",
        title: typeof section.title === "string" ? section.title : "",
        ...(typeof section.menuCardImage === "string" && section.menuCardImage ? { menuCardImage: section.menuCardImage } : {}),
    };
}

/** The whole offers section (settings + every offer, in order). Throws on an unknown shape. */
export function toOffersContent(raw: unknown): OffersContent {
    const settings = toOffersSettings(raw);
    const offers = isObject(raw) && Array.isArray(raw.offers) ? (raw.offers as Offer[]) : null;
    if (!settings || !offers) {
        throw new Error("GET /admin/offers: expected the section settings and an `offers` list (API-CONTRACT §4)");
    }
    return { ...settings, offers };
}
