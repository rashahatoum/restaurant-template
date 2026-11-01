"use client";

import CheckoutForm from "@/components/cart/CheckoutForm";
import OrderSentPanel from "@/components/cart/OrderSentPanel";
import BottomSheet from "@/components/ui/BottomSheet";
import { restaurantConfig } from "@/config/restaurant";
import { useOrderSent } from "@/hooks/useOrderSent";
import { formatPieces } from "@/lib/cart";
import { formatPrice } from "@/lib/format-price";
import { fillTemplate } from "@/lib/order";
import type { PricedCartLine } from "@/types/cart";
import type { OrderingOptions } from "@/types/order";
import Link from "next/link";

interface CheckoutSheetProps {
    open: boolean;
    onClose: () => void;
    lines: readonly PricedCartLine[];
    itemCount: number;
    subtotal: number;
    orderNote: string;
    options: OrderingOptions;
}

// Checkout straight from the menu: a short summary, the same CheckoutForm as
// /cart, then the thank-you panel. Must stay mounted after sending (the cart
// is empty by then), so the parent renders it regardless of the cart.
const CheckoutSheet = ({ open, onClose, lines, itemCount, subtotal, orderNote, options }: CheckoutSheetProps) => {
    const { sent, markSent, restore, reset } = useOrderSent();

    const close = () => {
        reset();
        onClose();
    };

    return (
        <BottomSheet open={open} onClose={close} title={sent ? "تم" : "أرسل الطلب"}>
            {sent ? (
                <OrderSentPanel
                    whatsAppHref={sent.whatsAppHref}
                    thankYou={fillTemplate(options.thankYou, {
                        restaurant: restaurantConfig.name,
                        name: sent.name,
                    })}
                    onRestore={restore}
                    onDone={close}
                />
            ) : lines.length === 0 ? (
                <p className="py-24 text-center text-muted">سلتك فاضية.</p>
            ) : (
                <div className="flex flex-col gap-16">
                    <div className="flex items-center justify-between gap-12 rounded-2xl bg-background px-14 py-10 text-sm">
                        <span className="text-muted">
                            {formatPieces(itemCount)} · <span className="font-bold text-foreground tabular-nums">{formatPrice(subtotal)}</span>
                        </span>
                        <Link href="/cart" className="font-bold text-primary hover:underline">
                            راجع السلة
                        </Link>
                    </div>

                    <CheckoutForm
                        lines={lines}
                        itemCount={itemCount}
                        subtotal={subtotal}
                        orderNote={orderNote}
                        options={options}
                        onSent={markSent}
                        showMenuLink={false}
                    />
                </div>
            )}
        </BottomSheet>
    );
};

export default CheckoutSheet;
