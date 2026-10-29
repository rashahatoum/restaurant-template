"use client";

import { formatPrice } from "@/lib/format-price";
import type { ProductOption } from "@/types/menu";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";

interface ItemPurchaseProps {
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
}

// The interactive part of a menu row: option toggle, live price, add button.
// Kept small so the rest of the row stays a Server Component.
const ItemPurchase = ({
    inputName,
    itemName,
    price,
    options,
    optionsLabel,
}: ItemPurchaseProps) => {
    const [selectedId, setSelectedId] = useState(options?.[0]?.id);
    const selected = options?.find((option) => option.id === selectedId);
    const total = price + (selected?.priceDelta ?? 0);

    return (
        <>
            {options && options.length > 0 && (
                <fieldset className="flex rounded-xl border border-border bg-background p-3 md:self-start">
                    <legend className="sr-only">{optionsLabel}</legend>

                    {/* Native radios: arrow keys and screen readers work out of the box */}
                    {options.map((option) => (
                        <label key={option.id} className="flex-1 cursor-pointer md:flex-none">
                            <input
                                type="radio"
                                name={inputName}
                                value={option.id}
                                checked={option.id === selectedId}
                                onChange={() => setSelectedId(option.id)}
                                className="peer sr-only"
                            />
                            <span className="flex h-32 items-center justify-center whitespace-nowrap rounded-[9px] px-4 text-xs font-bold text-muted transition-colors peer-checked:bg-primary peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-primary md:h-34 md:px-16 md:text-sm">
                                {/* Short label on phones, full name from md */}
                                <span className="md:hidden">{option.shortName ?? option.name}</span>
                                <span className="hidden md:inline">{option.name}</span>
                            </span>
                        </label>
                    ))}
                </fieldset>
            )}

            <div className="flex min-h-36 items-center justify-between gap-8 md:min-h-46">
                <span className="text-base font-extrabold text-primary md:text-lg">
                    {formatPrice(total)}
                </span>

                {/* Cart wiring comes with feat/cart. */}
                <button
                    type="button"
                    aria-label={`أضف ${itemName}${selected ? ` ${selected.name}` : ""} للسلة`}
                    className="flex size-36 shrink-0 items-center justify-center gap-6 rounded-full bg-primary text-lg text-background shadow-md shadow-primary/30 transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none md:h-46 md:w-auto md:px-18 md:text-base md:font-extrabold"
                >
                    <FiPlus aria-hidden="true" />
                    <span className="hidden md:inline">أضف</span>
                </button>
            </div>
        </>
    );
};

export default ItemPurchase;
