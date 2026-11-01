"use client";

import CheckoutSheet from "@/components/cart/CheckoutSheet";
import { cartActions, useCartLines, useOrderNote } from "@/hooks/useCart";
import { cartTotals, formatPieces, priceLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format-price";
import type { CartCatalog } from "@/types/cart";
import type { OrderingOptions } from "@/types/order";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";

interface CartBarProps {
    catalog: CartCatalog;
    orderingOptions: OrderingOptions;
}

// Fixed bar at the bottom of the menu once the cart has something: the cart
// (count + total, opens the cart popup) and "أكّد الطلب", which opens checkout in a
// sheet so ordering doesn't need a trip to /cart. Also announces cart changes
// to screen readers.
const CartBar = ({ catalog, orderingOptions }: CartBarProps) => {
    const lines = priceLines(useCartLines(), catalog);
    const { itemCount, subtotal } = cartTotals(lines);
    const orderNote = useOrderNote();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Lines the current menu can't price (item removed or unavailable) are dropped.
    useEffect(() => cartActions.prune(catalog), [catalog]);

    return (
        <>
            <p role="status" className="sr-only">
                {itemCount > 0 ? `بالسلة ${formatPieces(itemCount)}، المجموع ${formatPrice(subtotal)}` : ""}
            </p>

            {itemCount > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 px-page-gutter pb-[max(12px,env(safe-area-inset-bottom))]">
                    <div className="mx-auto flex h-60 max-w-560 items-center gap-8 rounded-full bg-primary p-6 ps-8 shadow-lg shadow-black/40">
                        <Link
                            href="/cart"
                            scroll={false}
                            aria-label={`السلة: ${formatPieces(itemCount)}، ${formatPrice(subtotal)}`}
                            className="flex h-full min-w-0 flex-1 items-center gap-10 rounded-full pe-8 text-background transition-colors hover:bg-background/10"
                        >
                            <span className="relative flex size-40 shrink-0 items-center justify-center rounded-full bg-background/15 text-xl">
                                <FiShoppingBag aria-hidden="true" />
                                <span className="absolute -top-2 -inset-e-2 flex h-18 min-w-18 items-center justify-center rounded-full bg-background px-4 text-xs font-extrabold text-primary tabular-nums">
                                    {itemCount}
                                </span>
                            </span>

                            <span className="flex min-w-0 flex-col leading-tight">
                                <span className="text-xs font-bold opacity-80">السلة</span>
                                <span className="truncate font-extrabold tabular-nums">{formatPrice(subtotal)}</span>
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsCheckoutOpen(true)}
                            className="flex h-full shrink-0 items-center gap-8 rounded-full bg-background px-18 font-extrabold text-primary transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none"
                        >
                            <FaWhatsapp aria-hidden="true" className="text-lg" />
                            أكّد الطلب
                        </button>
                    </div>
                </div>
            )}

            {/* Outside the bar: stays open on the thank-you panel after the cart empties */}
            <CheckoutSheet
                open={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                lines={lines}
                itemCount={itemCount}
                subtotal={subtotal}
                orderNote={orderNote}
                options={orderingOptions}
            />
        </>
    );
};

export default CartBar;
