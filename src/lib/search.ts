// Forgiving Arabic text search (pure functions, no dependency).

/** Harakat, Quranic marks, superscript alef, and tatweel (ـ). */
const IGNORED_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/**
 * Folds text so common spelling variants match:
 * "زِنجر" → "زنجر", "أكل" → "اكل", "وجبة" → "وجبه", "شرائح" → "شرايح".
 */
export function normalizeArabic(text: string): string {
    return text
        .toLowerCase()
        .replace(IGNORED_MARKS, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/[ىئ]/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/\s+/g, " ")
        .trim();
}

/** True when every word of the query appears in the (already normalized) text. */
export function matchesQuery(normalizedText: string, query: string): boolean {
    const words = normalizeArabic(query).split(" ").filter(Boolean);

    return words.every((word) => normalizedText.includes(word));
}
