"use client";

import { cartActions } from "@/hooks/useCart";
import { tableSessionActions } from "@/hooks/useTableSession";
import type { TableSession } from "@/lib/table-session";
import type { CartState } from "@/types/cart";
import { useState } from "react";

interface SentOrder {
    whatsAppHref: string;
    name: string;
    snapshot: CartState;
    table: TableSession | null;
}

// After "send": empty the cart and forget the scanned table right away, so the
// next person at that table (on the same phone) starts fresh. Keep a copy of
// both in memory, so the thank-you panel can put them back if the customer
// didn't send after all. A reload loses the copy (the order was most likely sent).
export function useOrderSent() {
    const [sent, setSent] = useState<SentOrder | null>(null);

    return {
        sent,
        markSent: ({ whatsAppHref, name }: { whatsAppHref: string; name: string }) => {
            setSent({
                whatsAppHref,
                name,
                snapshot: cartActions.snapshot(),
                table: tableSessionActions.snapshot(),
            });
            cartActions.clear();
            tableSessionActions.clear();
        },
        restore: () => {
            if (sent) {
                cartActions.restore(sent.snapshot);
                if (sent.table) tableSessionActions.set(sent.table);
            }
            setSent(null);
        },
        /** Forget the sent order (e.g. when its panel closes). */
        reset: () => setSent(null),
    };
}
