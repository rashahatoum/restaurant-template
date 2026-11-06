"use client";

import QuantityStepper from "@/components/ui/QuantityStepper";
import { cartActions, useCartLines } from "@/hooks/useCart";
import { lineIdOf } from "@/lib/cart";
import { formatPrice } from "@/lib/format-price";
import type { ProductOption } from "@/types/menu";
import { useState, type ReactNode } from "react";
import { FiPlus } from "react-icons/fi";

interface ItemPurchaseProps {
    /** Cart reference: lib/cart productKey / offerKey. */
    itemKey: string;
    /** Unique per item: groups the radio inputs. */
    inputName: string;
    /** Item name, for the add button's accessible label. */
    itemName: string;
    /** Base price, before the selected option. */
    price: number;
    /** Single-choice, price-changing options (e.g. size). The first is preselected. */
    options?: readonly ProductOption[];
    /** Name of the option group, read by screen readers (e.g. "الحجم"). */
    optionsLabel?: string;
    /** Extra control beside the add button (item details: share on WhatsApp). */
    secondaryAction?: ReactNode;
    /**
     * "row": the menu row. Price, toggle and buttons are grid items placed in
     *   MenuItemRow's grid areas (`price`, `size`, `add`), so the parent must be that grid.
     * "stacked": a large centered price, then the toggle, then the buttons (item details).
     */
    layout?: "row" | "stacked";
    /**
     * Dashboard preview: the size toggle works so the owner can check every
     * price, but the cart is never read or written ("+" is only its look).
     */
    preview?: boolean;
}

// The interactive part of a menu row: option toggle, live price, add button.
// Kept small so the rest of the row stays a Server Component.
const ItemPurchase = ({
    itemKey,
    inputName,
    itemName,
    price,
    options,
    optionsLabel,
    secondaryAction,
    layout = "row",
    preview = false,
}: ItemPurchaseProps) => {
    const isStacked = layout === "stacked";
    const [selectedId, setSelectedId] = useState(options?.[0]?.id);
    // Falls back to the first size if the picked one is gone (sizes edited in the preview)
    const selected = options?.find((option) => option.id === selectedId) ?? options?.[0];
    const total = price + (selected?.priceDelta ?? 0);

    // This item's lines, one per size (none in a preview: it never shows the real cart)
    const cartLines = useCartLines();
    const itemLines = preview ? [] : cartLines.filter((candidate) => candidate.itemKey === itemKey);
    const quantityOf = (optionId?: string) =>
        itemLines.find((candidate) => candidate.optionId === optionId)?.quantity ?? 0;

    const lineId = lineIdOf({ itemKey, optionId: selected?.id });
    const quantity = quantityOf(selected?.id);

    const priceText = formatPrice(total);
    // relative z-10 (row): above the row's stretched link
    const buttons = (
        <div className={`flex items-center gap-8 ${isStacked ? "" : "relative z-10 [grid-area:add]"}`}>
            {secondaryAction}

            {preview ? (
                // Same look as the "+" button, nothing to press
                <span
                    aria-hidden="true"
                    className="flex size-36 items-center justify-center rounded-full bg-primary text-lg text-background shadow-md shadow-primary/30 md:size-40"
                >
                    <FiPlus />
                </span>
            ) : (
                // Shows the quantity of the selected size: switching size switches the count
                <QuantityStepper
                    quantity={quantity}
                    onIncrement={() => cartActions.add(itemKey, selected?.id)}
                    onDecrement={() => cartActions.setQuantity(lineId, quantity - 1)}
                    itemLabel={`${itemName}${selected ? ` ${selected.name}` : ""}`}
                    addText="أضف"
                />
            )}
        </div>
    );

    return (
        <>
            {isStacked && (
                <span className="text-3xl font-extrabold text-primary tabular-nums md:text-4xl">{priceText}</span>
            )}

            {options && options.length > 0 && (
                <fieldset
                    className={`flex rounded-xl border border-border bg-background p-3 ${
                        isStacked ? "w-full md:w-auto" : "relative z-10 mt-8 [grid-area:size] md:justify-self-start"
                    }`}
                >
                    <legend className="sr-only">{optionsLabel}</legend>

                    {/* Native radios: arrow keys and screen readers work out of the box */}
                    {options.map((option) => {
                        const isSelected = option.id === selected?.id;
                        const inCart = quantityOf(option.id);

                        return (
                            <label key={option.id} className="relative flex-1 cursor-pointer md:flex-none">
                                <input
                                    type="radio"
                                    name={inputName}
                                    value={option.id}
                                    checked={isSelected}
                                    onChange={() => setSelectedId(option.id)}
                                    className="peer sr-only"
                                />
                                <span className="flex h-28 items-center justify-center gap-3 whitespace-nowrap rounded-[9px] px-4 text-xs font-bold text-muted transition-colors peer-checked:bg-primary peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-primary md:h-34 md:gap-6 md:px-16 md:text-sm">
                                    {/* Short label on phones, full name from md */}
                                    <span className="md:hidden">{option.shortName ?? option.name}</span>
                                    <span className="hidden md:inline">{option.name}</span>

                                    {/* How many of this size are in the cart, seen without switching.
                                        Phones: on the chip's corner (no room beside "دبل سمون"); md+: inline. */}
                                    {inCart > 0 && (
                                        <span
                                            className={`absolute -top-7 -inset-e-3 z-10 flex h-16 min-w-16 items-center justify-center rounded-full px-3 text-[10px] font-extrabold tabular-nums ring-2 ring-surface md:static md:h-18 md:min-w-18 md:text-xs md:ring-0 ${
                                                isSelected
                                                    ? "bg-foreground text-primary md:bg-background"
                                                    : "bg-primary text-background"
                                            }`}
                                        >
                                            <span className="sr-only">، بالسلة: </span>
                                            {inCart}
                                        </span>
                                    )}
                                </span>
                            </label>
                        );
                    })}
                </fieldset>
            )}

            {!isStacked && (
                <span className="mt-2 text-sm font-extrabold text-primary tabular-nums [grid-area:price] md:text-base">
                    {priceText}
                </span>
            )}

            {buttons}
        </>
    );
};

export default ItemPurchase;
