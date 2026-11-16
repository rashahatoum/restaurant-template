// The env switches (DASHBOARD_PLAN §5.1), server only (not NEXT_PUBLIC, so in
// the browser these always say "off"):
// - API_BASE_URL set → the Laravel API; unset → mock data and the browser
//   draft everywhere (local development without .env.local).
// - API_AREAS: which areas the API already has (comma-separated LiveArea
//   names). The menu, login and logout are on the API whenever API_BASE_URL is
//   set; every other area is listed here when the backend has it on staging,
//   public reads and dashboard together. Unset → the menu only (fails closed).

import type { LiveArea } from "@/types/dashboard";

export function isApiEnabled(): boolean {
    return Boolean(process.env.API_BASE_URL);
}

/** Every area, in the dashboard's order. A Record, so a new LiveArea can't be forgotten here. */
const KNOWN_AREAS: Record<LiveArea, true> = {
    menu: true,
    offers: true,
    banners: true,
    reviews: true,
    home: true,
    info: true,
    ordering: true,
};
export const LIVE_AREAS = Object.keys(KNOWN_AREAS) as LiveArea[];

const isKnownArea = (name: string): name is LiveArea => Object.hasOwn(KNOWN_AREAS, name);

/**
 * `API_AREAS` → the live areas (the menu always included). Throws, with a
 * message naming the problem, on an unknown name, or on `info` without
 * `ordering` (or the reverse): the ordering settings point at the phone and
 * branch ids of the site info, so one live without the other points at nothing.
 */
export function parseApiAreas(value: string | undefined): LiveArea[] {
    const names = (value ?? "")
        .split(",")
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean);

    const unknown = names.filter((name) => !isKnownArea(name));
    if (unknown.length > 0) {
        throw new Error(
            `API_AREAS: unknown area ${unknown.map((name) => `"${name}"`).join(", ")} (known: ${LIVE_AREAS.join(", ")})`
        );
    }

    const listed = new Set<LiveArea>(["menu", ...(names as LiveArea[])]);
    if (listed.has("info") !== listed.has("ordering")) {
        throw new Error(
            'API_AREAS: "info" and "ordering" go together (the ordering settings point at the site info\'s phones and branches): list both or neither'
        );
    }
    return LIVE_AREAS.filter((area) => listed.has(area));
}

/**
 * The areas on the API now: none without API_BASE_URL. Checked on every read
 * (build and server alike) and once when the server starts (instrumentation),
 * so a bad value stops everything instead of half working.
 */
export function liveAreas(): LiveArea[] {
    return isApiEnabled() ? parseApiAreas(process.env.API_AREAS) : [];
}

export function isAreaLive(area: LiveArea): boolean {
    return liveAreas().includes(area);
}
