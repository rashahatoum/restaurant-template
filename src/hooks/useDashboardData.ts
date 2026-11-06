"use client";

// What a dashboard screen shows: the browser draft if the owner edited on
// this device, else the original data from the server. The server render and
// hydration use the original (no mismatch), then the draft takes over.

import { getDraft, registerSeed, subscribe } from "@/lib/dashboard/draft-store";
import type { DashboardData } from "@/types/dashboard";
import { useSyncExternalStore } from "react";

export function useDashboardData(seed: DashboardData): DashboardData {
    registerSeed(seed);
    const draft = useSyncExternalStore(subscribe, getDraft, () => null);
    return draft ?? seed;
}

/** True when this device has edits (offers "رجّع البيانات الأصلية"). */
export function useHasDraft(): boolean {
    return useSyncExternalStore(subscribe, () => getDraft() !== null, () => false);
}
