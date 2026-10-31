"use client";

import { cartActions, useCartLines } from "@/hooks/useCart";
import { cartTotals, formatPieces, priceLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format-price";
import type { CartCatalog } from "@/types/cart";
import Link from "next/link";
import { useEffect } from "react";
import { FiChevronLeft, FiShoppingBag } from "react-icons/fi";

interface CartBarProps {
    catalog: CartCatalog;
}

// Fixed bar at the bottom of the menu once the cart has something: count,
// total, link to /cart. Also announces cart changes to screen readers.
const CartBar = ({ catalog }: CartBarProps) => {
    const lines = useCartLines();
    const { itemCount, subtotal } = cartTotals(priceLines(lines, catalog));

    // Lines the current menu can't price (item removed or unavailable) are dropped.
    useEffect(() => cartActions.prune(catalog), [catalog]);

    return (
        <>
            <p role="status" className="sr-only">
                {itemCount > 0 ? `بالسلة ${formatPieces(itemCount)}، المجموع ${formatPrice(subtotal)}` : ""}
            </p>

            {itemCount > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 px-page-gutter pb-[max(12px,env(safe-area-inset-bottom))]">
                    <Link
                        href="/cart"
                        className="mx-auto flex h-56 max-w-560 items-center gap-12 rounded-full bg-primary ps-8 pe-20 font-bold text-background shadow-lg shadow-black/40 transition-transform hover:scale-[1.01] active:scale-[0.99] motion-reduce:transition-none"
                    >
                        <span className="relative flex size-40 shrink-0 items-center justify-center rounded-full bg-background/15 text-xl">
                            <FiShoppingBag aria-hidden="true" />
                            <span className="absolute -top-2 -inset-e-2 flex h-18 min-w-18 items-center justify-center rounded-full bg-background px-4 text-xs font-extrabold text-primary tabular-nums">
                                {itemCount}
                            </span>
                        </span>

                        <span className="flex-1">عرض السلة</span>

                        <span className="flex items-center gap-4 font-extrabold tabular-nums">
                            {formatPrice(subtotal)}
                            <FiChevronLeft aria-hidden="true" />
                        </span>
                    </Link>
                </div>
            )}
        </>
    );
};

export default CartBar;
