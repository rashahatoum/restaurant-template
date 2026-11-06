"use client";

import { useCartLines } from "@/hooks/useCart";
import { countItems, formatPieces } from "@/lib/cart";
import Link from "next/link";
import type { ReactNode } from "react";
import { iconButtonClasses } from "./nav-styles";

// The header's cart button: the count lives in localStorage, so only this
// link is a client component. Opens as a popup over the current page
// (@modal/(.)cart); scroll={false} keeps its place.
const CartLink = ({ icon }: { icon: ReactNode }) => {
    const count = countItems(useCartLines());

    return (
        <Link
            href="/cart"
            scroll={false}
            aria-label={count > 0 ? `السلة، فيها ${formatPieces(count)}` : "السلة"}
            className={iconButtonClasses}
        >
            {icon}
            {count > 0 && (
                <span
                    aria-hidden="true"
                    className="absolute -top-2 -inset-e-2 flex h-18 min-w-18 items-center justify-center rounded-full bg-primary px-4 text-xs font-extrabold text-background tabular-nums"
                >
                    {count}
                </span>
            )}
        </Link>
    );
};

export default CartLink;
