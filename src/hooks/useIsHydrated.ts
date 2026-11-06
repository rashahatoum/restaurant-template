"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False on the server and during hydration, true after. Lets a component wait
 * for browser-only data (cart, dashboard draft) before showing "empty" or
 * "not found", or before taking initial form values from it.
 */
export function useIsHydrated(): boolean {
    return useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false
    );
}
