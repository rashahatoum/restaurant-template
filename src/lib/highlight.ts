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
