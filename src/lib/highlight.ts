export interface TextPart {
    text: string;
    highlighted: boolean;
}

/**
 * Splits editable copy on **markers**: "طعم **أصيل**" →
 * [{ text: "طعم ", highlighted: false }, { text: "أصيل", highlighted: true }].
 * Plain text only, so content from the dashboard can't inject HTML.
 */
/** Drops the markers, e.g. for aria-label: "الكرم **بالعروض**" → "الكرم بالعروض". */
export function toPlainText(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

/** Plain text plus where its (first) highlight sits; start === end when none. */
export interface MarkedText {
    plain: string;
    start: number;
    end: number;
}

/** "الكرم **بالعروض**" → { plain: "الكرم بالعروض", start: 6, end: 13 }. */
export function parseMarked(text: string): MarkedText {
    const plain = toPlainText(text);
    const match = /\*\*(.+?)\*\*/.exec(text);
    // The first match has no markers before it, so its index is the same in the plain text
    return match ? { plain, start: match.index, end: match.index + match[1].length } : { plain, start: 0, end: 0 };
}

/** Plain text with one range wrapped in ** (spaces at its edges stay outside). */
export function markRange({ plain, start, end }: MarkedText): string {
    const inner = plain.slice(start, end);
    const trimmedStart = start + (inner.length - inner.trimStart().length);
    const trimmedEnd = end - (inner.length - inner.trimEnd().length);
    if (trimmedEnd <= trimmedStart) return plain;
    return `${plain.slice(0, trimmedStart)}**${plain.slice(trimmedStart, trimmedEnd)}**${plain.slice(trimmedEnd)}`;
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

export function splitHighlights(text: string): TextPart[] {
    return text
        .split(/\*\*(.+?)\*\*/)
        .map((part, index) => ({ text: part, highlighted: index % 2 === 1 }))
        .filter((part) => part.text !== "");
}
