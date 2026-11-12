// Browser storage for the dashboard draft. Module-level like the cart store:
// no Provider; React reads it through hooks/useDashboardData. Used only by the
// local repository and the hooks. Disappears once the Laravel API is connected.

import { DRAFT_VERSION, parseDraft, type StoredDraft } from "@/lib/dashboard/draft";
import type { DashboardData } from "@/types/dashboard";

const STORAGE_KEY = "dashboard:v1";

let draft: DashboardData | null = null;
let isLoaded = false;
/** The original data the page was rendered with (set by useDashboardData). */
let seed: DashboardData | null = null;
const listeners = new Set<() => void>();

function readStorage(): DashboardData | null {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored ? parseDraft(JSON.parse(stored)) : null;
    } catch {
        return null;
    }
}

function emit() {
    listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    draft = readStorage();
    emit();
}

export function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener("storage", handleStorage);
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
    };
}

/** The saved draft, or null when nothing was edited on this device. */
export function getDraft(): DashboardData | null {
    if (!isLoaded) {
        draft = readStorage();
        isLoaded = true;
    }
    return draft;
}

/**
 * Remembers the data the page was rendered with. Always the latest: after a
 * save to the API the server renders again (refresh()) with fresh data.
 */
export function registerSeed(data: DashboardData) {
    seed = data;
}

/** True when categories and products live on the server (API on): saves go there. */
export function isMenuLive(): boolean {
    return seed?.menuSource === "api";
}

/**
 * The draft with the server's menu: with the API on, categories and products
 * always come from `server` (the latest render), never from an older draft.
 */
export function withServerMenu(data: DashboardData, server: DashboardData): DashboardData {
    if (server.menuSource !== "api" || data === server) return data;
    return { ...data, menuSource: "api", categories: server.categories, products: server.products };
}

/** What the dashboard shows: the draft if any, else the original data (the menu from the server when live). */
export function currentData(): DashboardData {
    if (!seed) throw new Error("Dashboard data read before useDashboardData registered the seed.");
    return withServerMenu(getDraft() ?? seed, seed);
}

/** Saves the whole data as the draft. Returns false when the browser refused (storage full or blocked). */
export function saveDraft(next: DashboardData): boolean {
    draft = next;
    isLoaded = true;
    let isStored = true;
    try {
        const stored: StoredDraft = { version: DRAFT_VERSION, data: next };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
        // Kept in memory for this visit
        isStored = false;
    }
    emit();
    return isStored;
}

/** Back to the original data ("رجّع البيانات الأصلية"). */
export function clearDraft() {
    draft = null;
    isLoaded = true;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Nothing stored
    }
    emit();
}
