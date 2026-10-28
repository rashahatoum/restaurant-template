// Phone helpers. Numbers are stored in international format ("+963930539614").

export function toTelHref(number: string): string {
    return `tel:${number}`;
}

/** wa.me wants digits only. `text` pre-fills the message (used by checkout later). */
export function toWhatsAppHref(number: string, text?: string): string {
    const digits = number.replace(/\D/g, "");
    return text
        ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
        : `https://wa.me/${digits}`;
}

/** "+963930539614" → "+963 930 539 614" (groups of 3 after the country code). */
export function formatPhone(number: string): string {
    const match = number.match(/^(\+\d{3})(\d+)$/);
    if (!match) return number;

    const [, countryCode, rest] = match;
    return `${countryCode} ${rest.replace(/(\d{3})(?=\d)/g, "$1 ")}`;
}
