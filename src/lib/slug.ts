// The readable link of a product, offer, category or branch (API-CONTRACT §2,
// «رابط الصفحة»): it's the record's public id. Pure; shared by the forms, the
// browser draft and its checks.

import { appError, fail, ok, type Result } from "@/lib/api/errors";

export const SLUG_MAX = 80;

/** Lowercase Latin letters and digits, single hyphens between: "chicken-shawarma". */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isSlug = (text: string) => text.length <= SLUG_MAX && SLUG_PATTERN.test(text);

/**
 * As typed → tidy: "Chicken Shawarma " → "chicken-shawarma". Only case, spaces
 * and hyphens are fixed; anything else (Arabic letters, symbols) stays, so the
 * rules can say what's wrong instead of silently dropping it.
 */
export const tidySlug = (text: string) =>
    text
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "");

/**
 * The «رابط» a form sends: only a new one (empty or unchanged → nothing, so the
 * API keeps it or makes one), its shape checked here; uniqueness is the saver's.
 */
export function slugToSend(typed: string, currentId: string | undefined): Result<string | undefined> {
    const slug = tidySlug(typed);
    if (!slug || slug === currentId) return ok(undefined);
    const problem = slugProblem(slug, new Set());
    return problem ? fail(appError("validation", { fieldErrors: { slug: [problem] } })) : ok(slug);
}

/** Why this slug can't be used, or null: the form and the browser draft give the same answer as the API. */
export function slugProblem(slug: string, taken: ReadonlySet<string>): string | null {
    if (slug.length > SLUG_MAX) return `الرابط ${SLUG_MAX} حرف أو أقل`;
    if (!SLUG_PATTERN.test(slug)) return "أحرف إنكليزية صغيرة وأرقام وشحطة (-) بس، متل chicken-shawarma";
    if (taken.has(slug)) return "هالرابط مستعمل، اختار غيره";
    return null;
}
