/** Arabic-Indic (٠ U+0660…) and Persian (۰ U+06F0…) digits, as typed on Arabic keyboards. */
const EASTERN_DIGITS = /[٠-٩۰-۹]/g;

/** "٢٥٠" → "250"; other characters stay as they are. */
export function toWesternDigits(text: string): string {
    return text.replace(EASTERN_DIGITS, (digit) => {
        const code = digit.charCodeAt(0);
        return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
    });
}
