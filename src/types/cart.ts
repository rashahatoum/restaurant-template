// Cart types. Only references are stored (in localStorage); names and prices
// always come from the current menu, so an edited or stale cart can't change
// what the restaurant charges.

import type { ProductOption } from "@/types/menu";

/** What the browser keeps: item reference, chosen option, quantity, note. */
export interface CartLine {
    /** "product:<id>" or "offer:<id>" (see lib/cart productKey / offerKey). */
    itemKey: string;
    /** Required when the item has options (e.g. size). */
    optionId?: string;
    quantity: number;
    /** Free-form request, e.g. "بدون ثوم". */
    note?: string;
}

/** Everything the browser keeps for the cart. */
export interface CartState {
    lines: readonly CartLine[];
    /** Note on the whole order, e.g. "بدنا الطلب الساعة 8". */
    note: string;
}

/** An orderable item as the cart sees it, built from the menu and offers. */
export interface CartCatalogItem {
    name: string;
    image?: string;
    /** Base price, before the option delta. */
    price: number;
    isAvailable: boolean;
    /** Single-choice, price-changing options (size). */
    options?: readonly ProductOption[];
}

/** Keyed by CartLine.itemKey. */
export type CartCatalog = Readonly<Record<string, CartCatalogItem>>;

/** A cart line resolved against the catalog, ready to display or send. */
export interface PricedCartLine extends CartLine {
    lineId: string;
    name: string;
    image?: string;
    optionName?: string;
    unitPrice: number;
    lineTotal: number;
}
