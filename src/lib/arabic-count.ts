// "قطعة وحدة / قطعتين / 3 قطع / 11 قطعة": Arabic counted nouns.

interface CountForms {
    /** 1: the full phrase, e.g. "قطعة وحدة". */
    one: string;
    /** 2: the dual, e.g. "قطعتين". */
    two: string;
    /** 3–10: plural, e.g. "قطع". */
    few: string;
    /** 0 and 11+: singular, e.g. "قطعة". */
    many: string;
}

export function formatCount(count: number, forms: CountForms): string {
    if (count === 1) return forms.one;
    if (count === 2) return forms.two;
    if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
    return `${count} ${forms.many}`;
}
