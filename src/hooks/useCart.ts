"use client";

// The cart store: one module-level object, persisted to localStorage, read
// with useSyncExternalStore. No Provider needed; the server snapshot is an
// empty cart, so server HTML and the first client render always match.
// Other tabs stay in sync through the "storage" event.

import * as cart from "@/lib/cart";
import type { CartCatalog, CartLine, CartState } from "@/types/cart";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cart:v1";
const EMPTY: CartState = { lines: [], note: "" };

let state: CartState = EMPTY;
let isLoaded = false;
const listeners = new Set<() => void>();

function readStorage(): CartState {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored ? cart.parseCartState(JSON.parse(stored)) : EMPTY;
    } catch {
        // Blocked storage or broken JSON: start empty.
        return EMPTY;
    }
}

function emit() {
    listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    state = readStorage();
    emit();
}

function subscribe(listener: () => void) {
    if (listeners.size === 0) window.addEventListener("storage", handleStorage);
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
    };
}

function getState() {
    if (!isLoaded) {
        state = readStorage();
        isLoaded = true;
    }
    return state;
}

function update(next: Partial<CartState>) {
    state = { ...getState(), ...next };
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage full or blocked: the cart still works for this visit.
    }
    emit();
}

/** Current cart lines (empty on the server and during hydration). */
export function useCartLines(): readonly CartLine[] {
    return useSyncExternalStore(
        subscribe,
        () => getState().lines,
        () => EMPTY.lines
    );
}

/** Note on the whole order. */
export function useOrderNote(): string {
    return useSyncExternalStore(
        subscribe,
        () => getState().note,
        () => EMPTY.note
    );
}

const noopSubscribe = () => () => {};

/** False on the server and during hydration: lets a page wait before showing "empty cart". */
export function useIsHydrated(): boolean {
    return useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false
    );
}

const lines = () => getState().lines;

export const cartActions = {
    add: (itemKey: string, optionId?: string) =>
        update({ lines: cart.addItem(lines(), itemKey, optionId) }),
    setQuantity: (lineId: string, quantity: number) =>
        update({ lines: cart.setQuantity(lines(), lineId, quantity) }),
    setNote: (lineId: string, note: string) =>
        update({ lines: cart.setNote(lines(), lineId, note) }),
    remove: (lineId: string) => update({ lines: cart.removeLine(lines(), lineId) }),
    setOrderNote: (note: string) => update({ note: note.slice(0, cart.MAX_ORDER_NOTE_LENGTH) }),
    /** Empties the cart and the order note (after an order is sent). */
    clear: () => update(EMPTY),
    /** The whole cart as stored (lines + order note), e.g. to keep before clear. */
    snapshot: (): CartState => getState(),
    /** Puts back a cart taken before clear (the customer didn't send after all). */
    restore: (snapshot: CartState) => update(snapshot),
    /** Drops lines the current menu can't price (removed, unavailable, unknown size). */
    prune: (catalog: CartCatalog) => {
        const current = lines();
        const valid = new Set(cart.priceLines(current, catalog).map((line) => line.lineId));
        if (valid.size !== current.length) {
            update({ lines: current.filter((line) => valid.has(cart.lineIdOf(line))) });
        }
    },
};
