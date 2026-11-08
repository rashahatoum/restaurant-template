// Restaurant info helpers, pure: social platforms (order, names, links) and
// opening hours written from two clock times. Shared by the footer, the
// JSON-LD and the dashboard.

import type { ContactPhone, SocialPlatform } from "@/types/content";

/* =========================
   PHONES
========================= */

/** The restaurant's own numbers (shown on the site); branch staff numbers are left out. */
export const publicPhones = (phones: readonly ContactPhone[]) => phones.filter((phone) => !phone.branchId);

/** The number that receives a branch's table orders: its first phone with WhatsApp. */
export const branchWhatsApp = (phones: readonly ContactPhone[], branchId: string) =>
    phones.find((phone) => phone.branchId === branchId && phone.hasWhatsApp);

/* =========================
   SOCIAL LINKS
========================= */

/** In the order the footer shows them. `hosts` are the domains a profile link may use. */
export const SOCIAL_PLATFORMS: readonly { platform: SocialPlatform; name: string; hosts: readonly string[]; example: string }[] = [
    { platform: "instagram", name: "Instagram", hosts: ["instagram.com"], example: "instagram.com/ahlalkaram" },
    { platform: "facebook", name: "Facebook", hosts: ["facebook.com", "fb.com", "fb.me"], example: "facebook.com/ahlalkaram" },
    { platform: "threads", name: "Threads", hosts: ["threads.net", "threads.com"], example: "threads.net/@ahlalkaram" },
    { platform: "tiktok", name: "TikTok", hosts: ["tiktok.com"], example: "tiktok.com/@ahlalkaram" },
];

export const socialName = (platform: SocialPlatform) =>
    SOCIAL_PLATFORMS.find((option) => option.platform === platform)?.name ?? platform;

/**
 * A profile link as typed ("instagram.com/x", "www.instagram.com/x/") →
 * "https://instagram.com/x". Null when it isn't a page on that platform.
 */
export function normalizeSocialUrl(platform: SocialPlatform, text: string): string | null {
    const typed = text.trim();
    if (!typed) return null;
    try {
        const url = new URL(/^https?:\/\//i.test(typed) ? typed : `https://${typed}`);
        const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");
        const hosts = SOCIAL_PLATFORMS.find((option) => option.platform === platform)?.hosts ?? [];
        if (!hosts.includes(host) || url.pathname.replace(/\/+$/, "") === "") return null;
        return `https://${host}${url.pathname.replace(/\/+$/, "")}${url.search}`;
    } catch {
        return null;
    }
}

/* =========================
   OPENING HOURS
   The same every day: two clock times ("09:00", "00:00") give the text the
   footer shows and the schema.org value Google reads.
========================= */

/** Part of the day, as said in Syria. */
function dayPart(hours: number): string {
    if (hours < 5) return "بالليل";
    if (hours < 12) return "الصبح";
    if (hours < 15) return "الضهر";
    if (hours < 18) return "العصر";
    return "المسا";
}

/** "21:30" → "9:30 المسا", "00:00" → "12 بالليل". */
function spokenTime(clock: string): string {
    const [hours, minutes] = clock.split(":").map(Number);
    const hour = hours % 12 || 12;
    return `${minutes ? `${hour}:${String(minutes).padStart(2, "0")}` : hour} ${dayPart(hours)}`;
}

/** "09:00", "00:00" → "يومياً من 9 الصبح لـ 12 بالليل". */
export const hoursText = (opens: string, closes: string) => `يومياً من ${spokenTime(opens)} لـ ${spokenTime(closes)}`;

/** "09:00", "00:00" → ["Mo-Su 09:00-24:00"] (closing at midnight is written 24:00). */
export const hoursSchema = (opens: string, closes: string) => [`Mo-Su ${opens}-${closes === "00:00" ? "24:00" : closes}`];

/** ["Mo-Su 09:00-24:00"] → { opens: "09:00", closes: "00:00" }; undefined for any other shape. */
export function parseHoursSchema(schema: readonly string[] | undefined): { opens: string; closes: string } | undefined {
    const match = schema?.length === 1 ? /^Mo-Su (\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(schema[0]) : null;
    return match ? { opens: match[1], closes: match[2] === "24:00" ? "00:00" : match[2] } : undefined;
}
