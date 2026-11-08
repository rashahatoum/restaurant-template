export interface TextPart {
    text: string;
    highlighted: boolean;
}

/**
 * Splits editable copy on **markers**: "طعم **أصيل**" →
 * [{ text: "طعم ", highlighted: false }, { text: "أصيل", highlighted: true }].
 * Plain text only, so content from the dashboard can't inject HTML.
 */
export function splitHighlights(text: string): TextPart[] {
    return text
        .split(/\*\*(.+?)\*\*/)
        .map((part, index) => ({ text: part, highlighted: index % 2 === 1 }))
        .filter((part) => part.text !== "");
}

/** Drops the markers, e.g. for aria-label: "الكرم **بالعروض**" → "الكرم بالعروض". */
export function toPlainText(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

/* =========================
   EDITING (dashboard «ميّز»)
   The owner edits the plain text; the highlights are kept as ranges in it
   and written back as ** markers.
========================= */

export interface TextRange {
    start: number;
    end: number;
}

/** Plain text plus where its highlights sit, in order. */
export interface MarkedRanges {
    plain: string;
    ranges: readonly TextRange[];
}

/** "**أهل** الكرم **بالعروض**" → { plain: "أهل الكرم بالعروض", ranges: [0–3, 10–17] }. */
export function parseMarks(text: string): MarkedRanges {
    const ranges: TextRange[] = [];
    let plain = "";
    for (const part of splitHighlights(text)) {
        if (part.highlighted) ranges.push({ start: plain.length, end: plain.length + part.text.length });
        plain += part.text;
    }
    return { plain, ranges };
}

/**
 * The plain text with its ranges wrapped in **. Overlapping or touching
 * ranges merge (two markers side by side would break the parsing), and
 * spaces at a range's edges stay outside it.
 */
export function markRanges(plain: string, ranges: readonly TextRange[]): string {
    const merged: TextRange[] = [];
    for (const range of [...ranges].sort((a, b) => a.start - b.start)) {
        const last = merged.at(-1);
        if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
        else merged.push({ ...range });
    }

    let result = "";
    let cursor = 0;
    for (const { start, end } of merged) {
        const inner = plain.slice(start, end);
        const trimmedStart = start + (inner.length - inner.trimStart().length);
        const trimmedEnd = end - (inner.length - inner.trimEnd().length);
        if (trimmedEnd <= trimmedStart) continue;
        result += `${plain.slice(cursor, trimmedStart)}**${plain.slice(trimmedStart, trimmedEnd)}**`;
        cursor = trimmedEnd;
    }
    return result + plain.slice(cursor);
}

/** The selection highlighted, or un-highlighted when it's all highlighted already. */
export function toggleMark({ plain, ranges }: MarkedRanges, selection: TextRange): string {
    const isInside = (index: number) => ranges.some((range) => index >= range.start && index < range.end);
    let isAllMarked = true;
    for (let index = selection.start; index < selection.end; index++) {
        if (plain[index].trim() && !isInside(index)) isAllMarked = false;
    }
    if (!isAllMarked) return markRanges(plain, [...ranges, selection]);

    // Cut the selection out of every range it touches
    const kept = ranges.flatMap((range) => [
        { start: range.start, end: Math.min(range.end, selection.start) },
        { start: Math.max(range.start, selection.end), end: range.end },
    ]);
    return markRanges(plain, kept.filter((range) => range.end > range.start));
}

/**
 * After the plain text is edited: each highlight moves with the text around
 * it. Typing inside a highlighted word keeps it highlighted; a highlight cut
 * by the edit keeps what's left of it.
 */
export function shiftMarks(previous: MarkedRanges, plain: string): string {
    const before = previous.plain;
    // The edited stretch: what's left after the common start and end
    let prefix = 0;
    while (prefix < before.length && prefix < plain.length && before[prefix] === plain[prefix]) prefix++;
    let suffix = 0;
    while (
        suffix < before.length - prefix &&
        suffix < plain.length - prefix &&
        before[before.length - 1 - suffix] === plain[plain.length - 1 - suffix]
    ) {
        suffix++;
    }
    const oldEnd = before.length - suffix;
    const newEnd = plain.length - suffix;
    const delta = plain.length - before.length;

    const ranges = previous.ranges.flatMap((range): TextRange[] => {
        if (range.end <= prefix) return [range];
        if (range.start >= oldEnd) return [{ start: range.start + delta, end: range.end + delta }];
        // Edited inside the highlight
        if (range.start <= prefix && range.end >= oldEnd) return [{ start: range.start, end: range.end + delta }];
        // The edit cut one side of it
        return range.start < prefix ? [{ start: range.start, end: prefix }] : [{ start: newEnd, end: range.end + delta }];
    });
    return markRanges(plain, ranges);
}

/* Single highlight (section titles) */

/** Plain text plus where its (first) highlight sits; start === end when none. */
export interface MarkedText {
    plain: string;
    start: number;
    end: number;
}

/** "الكرم **بالعروض**" → { plain: "الكرم بالعروض", start: 6, end: 13 }. */
export function parseMarked(text: string): MarkedText {
    const { plain, ranges } = parseMarks(text);
    const first = ranges[0];
    return first ? { plain, start: first.start, end: first.end } : { plain, start: 0, end: 0 };
}

/** Plain text with one range wrapped in ** (spaces at its edges stay outside). */
export function markRange({ plain, start, end }: MarkedText): string {
    return markRanges(plain, [{ start, end }]);
}

/**
 * After the plain text is edited: keeps the highlight on the same words (the
 * occurrence nearest where it was), or drops it when those words are gone.
 */
export function remark(previous: MarkedText, plain: string): string {
    const word = previous.plain.slice(previous.start, previous.end);
    if (!word) return plain;

    let best = -1;
    for (let index = plain.indexOf(word); index !== -1; index = plain.indexOf(word, index + 1)) {
        if (best === -1 || Math.abs(index - previous.start) < Math.abs(best - previous.start)) best = index;
    }
    return best === -1 ? plain : markRange({ plain, start: best, end: best + word.length });
}
