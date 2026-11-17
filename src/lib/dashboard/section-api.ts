// A home section's JSON from the Laravel API → our types, pure: the offers
// and reviews sections (settings + a list). Both use the confirmed flat shape
// only (API-CONTRACT §4, answers of 2026-11-17; seen on staging):
//   { isEnabled, eyebrow, …, offers: [...] } / { isEnabled, eyebrow, …, reviews: [...] }
// Anything else fails loudly (better than an empty screen).

import type { Offer, OffersContent, Review, ReviewsContent } from "@/types/content";
import type { OffersSettings, ReviewsSettings } from "@/types/dashboard";

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/** The section settings at the top level (the confirmed shape), or null. */
function flatSection(raw: unknown): Record<string, unknown> | null {
    return isObject(raw) && typeof raw.isEnabled === "boolean" ? raw : null;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** The offers section's own settings (flat); null when they aren't there. */
export function toOffersSettings(raw: unknown): OffersSettings | null {
    const section = flatSection(raw);
    if (!section) return null;
    return {
        isEnabled: section.isEnabled as boolean,
        eyebrow: text(section.eyebrow),
        title: text(section.title),
        ...(typeof section.menuCardImage === "string" && section.menuCardImage ? { menuCardImage: section.menuCardImage } : {}),
    };
}

/** The reviews section's own settings (flat); null when they aren't there. */
export function toReviewsSettings(raw: unknown): ReviewsSettings | null {
    const section = flatSection(raw);
    if (!section) return null;
    return {
        isEnabled: section.isEnabled as boolean,
        eyebrow: text(section.eyebrow),
        title: text(section.title),
        defaultQuestion: text(section.defaultQuestion),
    };
}

/** The list next to the section, or a loud error. */
function listOf<T>(raw: unknown, key: string, what: string): T[] {
    if (isObject(raw) && Array.isArray(raw[key])) return raw[key] as T[];
    throw new Error(`GET /admin/${what}: expected the section settings and a \`${key}\` list (API-CONTRACT §4)`);
}

/** The whole offers section (settings + every offer, in order). Throws on an unknown shape. */
export function toOffersContent(raw: unknown): OffersContent {
    const settings = toOffersSettings(raw);
    if (!settings) throw new Error("GET /admin/offers: expected the section settings (API-CONTRACT §4)");
    return { ...settings, offers: listOf<Offer>(raw, "offers", "offers") };
}

/** The whole reviews section (settings + every review, in order). Throws on an unknown shape. */
export function toReviewsContent(raw: unknown): ReviewsContent {
    const settings = toReviewsSettings(raw);
    if (!settings) throw new Error("GET /admin/reviews: expected the section settings (API-CONTRACT §4)");
    return { ...settings, reviews: listOf<Review>(raw, "reviews", "reviews") };
}
