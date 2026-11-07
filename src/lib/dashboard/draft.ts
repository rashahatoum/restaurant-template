// The dashboard's browser draft (before the Laravel API): a full copy of the
// data, saved after the first edit. Pure checks for what comes back from
// storage, so a broken or outdated draft falls back to the original data.

import type { DashboardData } from "@/types/dashboard";

/** Bumped when the stored shape changes; an older draft falls back to the original data. 2: banner buttons store a target, not a link. */
export const DRAFT_VERSION = 2;

export interface StoredDraft {
    version: typeof DRAFT_VERSION;
    data: DashboardData;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isProductLike = (value: unknown) =>
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.price === "number" &&
    typeof value.isAvailable === "boolean" &&
    typeof value.isBestSeller === "boolean";

/** The stored draft's data, or null if it's missing, from another version or malformed. */
export function parseDraft(value: unknown): DashboardData | null {
    if (!isObject(value) || value.version !== DRAFT_VERSION || !isObject(value.data)) return null;
    const data = value.data;

    const isValid =
        Array.isArray(data.categories) &&
        Array.isArray(data.products) &&
        data.products.every(isProductLike) &&
        Array.isArray(data.banners) &&
        isObject(data.offers) &&
        isObject(data.reviews) &&
        isObject(data.about) &&
        isObject(data.siteInfo) &&
        isObject(data.ordering);

    return isValid ? (data as unknown as DashboardData) : null;
}
