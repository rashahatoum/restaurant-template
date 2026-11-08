// Phone helpers. Numbers are stored in international format ("+963930539614").

import { toWesternDigits } from "@/lib/digits";

/**
 * A Syrian number as typed ("0930 539 614", "+963 930…", "00963…", Arabic
 * digits) → "+963930539614". Null when it isn't one (mobile: 9 digits after
 * 963; landline: area code + number, 8 digits).
 */
export function normalizePhone(text: string): string | null {
    let digits = toWesternDigits(text).replace(/[\s\-().]/g, "");
    if (digits.startsWith("+")) digits = digits.slice(1);
    else if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = `963${digits.slice(1)}`;
    else if (/^9\d{8}$/.test(digits)) digits = `963${digits}`;
    return /^963\d{8,9}$/.test(digits) ? `+${digits}` : null;
}

export function toTelHref(number: string): string {
    return `tel:${number}`;
}

/** wa.me wants digits only. `text` pre-fills the message (checkout). */
export function toWhatsAppHref(number: string, text?: string): string {
    const digits = number.replace(/\D/g, "");
    return text
        ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
        : `https://wa.me/${digits}`;
}

/** No number: WhatsApp asks who to send `text` to (sharing a link with a friend). */
export function toWhatsAppShareHref(text: string): string {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** "+963930539614" → "+963 930 539 614" (groups of 3 after the country code). */
export function formatPhone(number: string): string {
    const match = number.match(/^(\+\d{3})(\d+)$/);
    if (!match) return number;

    const [, countryCode, rest] = match;
    return `${countryCode} ${rest.replace(/(\d{3})(?=\d)/g, "$1 ")}`;
}
