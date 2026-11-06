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

/** Remembers the original data (same object on every render, so assigning once is enough). */
export function registerSeed(data: DashboardData) {
    seed ??= data;
}

/** What the dashboard shows: the draft if any, else the original data. */
export function currentData(): DashboardData {
    const data = getDraft() ?? seed;
    if (!data) throw new Error("Dashboard data read before useDashboardData registered the seed.");
    return data;
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
