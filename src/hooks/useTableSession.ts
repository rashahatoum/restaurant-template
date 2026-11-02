"use client";

// The table the customer scanned, remembered for a few hours in
// localStorage. Same pattern as useCart: a module-level value read with
// useSyncExternalStore, null on the server and during hydration.

import { parseTableSession, type TableSession } from "@/lib/table-session";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "table:v1";

let session: TableSession | null = null;
let isLoaded = false;
const listeners = new Set<() => void>();

function read(): TableSession | null {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored ? parseTableSession(JSON.parse(stored), Date.now()) : null;
    } catch {
        return null;
    }
}

function getSession() {
    if (!isLoaded) {
        session = read();
        isLoaded = true;
    }
    return session;
}

function save(next: TableSession | null) {
    session = next;
    isLoaded = true;
    try {
        if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Blocked storage: remembered for this page view only.
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** The scanned table, or null (none, expired, or still hydrating). */
export function useTableSession(): TableSession | null {
    return useSyncExternalStore(subscribe, getSession, () => null);
}

export const tableSessionActions = {
    set: (next: TableSession) => save(next),
    clear: () => save(null),
};
