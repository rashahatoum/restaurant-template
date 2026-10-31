// Pure cart logic: no React, no storage. Used by the cart store (hooks/useCart)
// and, later, by checkout (WhatsApp message, delivery fee).

import type { CartCatalog, CartLine, CartState, PricedCartLine } from "@/types/cart";

export const MAX_QUANTITY = 99;
export const MAX_NOTE_LENGTH = 120;
export const MAX_ORDER_NOTE_LENGTH = 300;

export const productKey = (productId: string) => `product:${productId}`;
export const offerKey = (offerId: string) => `offer:${offerId}`;

/** The same item in two sizes is two lines. */
export const lineIdOf = (line: Pick<CartLine, "itemKey" | "optionId">) =>
    `${line.itemKey}|${line.optionId ?? ""}`;

/* =========================
   UPDATES (return a new array)
========================= */

export function addItem(
    lines: readonly CartLine[],
    itemKey: string,
    optionId?: string
): readonly CartLine[] {
    const lineId = lineIdOf({ itemKey, optionId });
    const existing = lines.find((line) => lineIdOf(line) === lineId);

    return existing
        ? setQuantity(lines, lineId, existing.quantity + 1)
        : [...lines, { itemKey, optionId, quantity: 1 }];
}

/** 0 or less removes the line. */
export function setQuantity(
    lines: readonly CartLine[],
    lineId: string,
    quantity: number
): readonly CartLine[] {
    if (quantity <= 0) return removeLine(lines, lineId);

    return lines.map((line) =>
        lineIdOf(line) === lineId
            ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) }
            : line
    );
}

export function setNote(
    lines: readonly CartLine[],
    lineId: string,
    note: string
): readonly CartLine[] {
    const trimmed = note.slice(0, MAX_NOTE_LENGTH);

    return lines.map((line) =>
        lineIdOf(line) === lineId ? { ...line, note: trimmed || undefined } : line
    );
}

export function removeLine(lines: readonly CartLine[], lineId: string): readonly CartLine[] {
    return lines.filter((line) => lineIdOf(line) !== lineId);
}

/* =========================
   READING
========================= */

/**
 * Resolves lines against the current menu. Lines whose item is gone,
 * unavailable, or has an unknown option are left out.
 */
export function priceLines(
    lines: readonly CartLine[],
    catalog: CartCatalog
): PricedCartLine[] {
    return lines.flatMap((line) => {
        const item = catalog[line.itemKey];
        if (!item || !item.isAvailable) return [];

        const hasOptions = Boolean(item.options?.length);
        const option = item.options?.find((candidate) => candidate.id === line.optionId);
        if (hasOptions !== Boolean(option)) return [];

        const unitPrice = item.price + (option?.priceDelta ?? 0);

        return [
            {
                ...line,
                lineId: lineIdOf(line),
                name: item.name,
                image: item.image,
                optionName: option?.name,
                unitPrice,
                lineTotal: unitPrice * line.quantity,
            },
        ];
    });
}

export function cartTotals(lines: readonly PricedCartLine[]) {
    return {
        /** Pieces, not lines: 2× shawarma = 2. */
        itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
        subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    };
}

/** 1 → "قطعة وحدة", 2 → "قطعتين", 3–10 → "3 قطع", 11+ → "11 قطعة". */
export function formatPieces(count: number) {
    if (count === 1) return "قطعة وحدة";
    if (count === 2) return "قطعتين";
    if (count <= 10) return `${count} قطع`;
    return `${count} قطعة`;
}

/** Raw piece count (no catalog needed), e.g. for the NavBar badge. */
export const countItems = (lines: readonly CartLine[]) =>
    lines.reduce((sum, line) => sum + line.quantity, 0);

/** Validates the whole stored cart; see parseCartLines. */
export function parseCartState(value: unknown): CartState {
    if (typeof value !== "object" || value === null) return { lines: [], note: "" };

    const { lines, note } = value as Record<string, unknown>;
    return {
        lines: parseCartLines(lines),
        note: typeof note === "string" ? note.slice(0, MAX_ORDER_NOTE_LENGTH) : "",
    };
}

/**
 * Validates data read from storage (it may be edited by hand or come from
 * an older version). Anything malformed is dropped instead of throwing.
 */
export function parseCartLines(value: unknown): readonly CartLine[] {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    const lines: CartLine[] = [];

    for (const raw of value) {
        if (typeof raw !== "object" || raw === null) continue;
        const { itemKey, optionId, quantity, note } = raw as Record<string, unknown>;

        if (typeof itemKey !== "string") continue;
        if (optionId !== undefined && typeof optionId !== "string") continue;
        if (!Number.isInteger(quantity) || (quantity as number) < 1) continue;

        const line: CartLine = {
            itemKey,
            optionId,
            quantity: Math.min(quantity as number, MAX_QUANTITY),
            note: typeof note === "string" && note ? note.slice(0, MAX_NOTE_LENGTH) : undefined,
        };

        const lineId = lineIdOf(line);
        if (seen.has(lineId)) continue;
        seen.add(lineId);
        lines.push(line);
    }

    return lines;
}
