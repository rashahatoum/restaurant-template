"use client";

import { cartActions } from "@/hooks/useCart";
import type { CartState } from "@/types/cart";
import { useState } from "react";

interface SentOrder {
    whatsAppHref: string;
    name: string;
    snapshot: CartState;
}

// After "send": empty the cart right away but keep a copy in memory, so the
// thank-you panel can put it back if the customer didn't send after all.
// A reload loses the copy (the order was most likely sent).
export function useOrderSent() {
    const [sent, setSent] = useState<SentOrder | null>(null);

    return {
        sent,
        markSent: ({ whatsAppHref, name }: { whatsAppHref: string; name: string }) => {
            setSent({ whatsAppHref, name, snapshot: cartActions.snapshot() });
            cartActions.clear();
        },
        restore: () => {
            if (sent) cartActions.restore(sent.snapshot);
            setSent(null);
        },
        /** Forget the sent order (e.g. when its panel closes). */
        reset: () => setSent(null),
    };
}
