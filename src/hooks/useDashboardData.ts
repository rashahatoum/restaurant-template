"use client";

// What a dashboard screen shows: the browser draft if the owner edited on
// this device, else the original data from the server. The server render and
// hydration use the original (no mismatch), then the draft takes over.
// With the API on, categories and products always come from the server's
// latest render (D7c): a save refreshes the page, which brings a new seed.

import { getDraft, registerSeed, subscribe, withServerMenu } from "@/lib/dashboard/draft-store";
import type { DashboardData } from "@/types/dashboard";
import { useMemo, useSyncExternalStore } from "react";

export function useDashboardData(seed: DashboardData): DashboardData {
    registerSeed(seed);
    const draft = useSyncExternalStore(subscribe, getDraft, () => null);
    // Memoized: the merge makes a new object, and screens depend on its identity
    return useMemo(() => (draft ? withServerMenu(draft, seed) : seed), [draft, seed]);
}

/** True when this device has edits (offers "رجّع البيانات الأصلية"). */
export function useHasDraft(): boolean {
    return useSyncExternalStore(subscribe, () => getDraft() !== null, () => false);
}
