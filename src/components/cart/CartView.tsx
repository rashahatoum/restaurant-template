"use client";

import CheckoutForm from "@/components/cart/CheckoutForm";
import OrderSentPanel from "@/components/cart/OrderSentPanel";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { restaurantConfig } from "@/config/restaurant";
import { cartActions, useCartLines, useIsHydrated, useOrderNote } from "@/hooks/useCart";
import { cartTotals, MAX_NOTE_LENGTH, MAX_ORDER_NOTE_LENGTH, priceLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format-price";
import { fillTemplate } from "@/lib/order";
import type { CartCatalog, CartState } from "@/types/cart";
import type { OrderingOptions } from "@/types/order";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

interface CartViewProps {
    catalog: CartCatalog;
    orderingOptions: OrderingOptions;
}

// The /cart page body: lines with quantity, note and remove, the order
// note, then checkout (order type, details, totals, WhatsApp).
// Sending empties the cart right away; a copy stays in memory so the
// thank-you panel can put it back if the customer didn't send after all.
const CartView = ({ catalog, orderingOptions }: CartViewProps) => {
    const isHydrated = useIsHydrated();
    const storedLines = useCartLines();
    const lines = priceLines(storedLines, catalog);
    const { itemCount, subtotal } = cartTotals(lines);
    const orderNote = useOrderNote();
    const [sent, setSent] = useState<{ whatsAppHref: string; name: string; snapshot: CartState } | null>(null);

    useEffect(() => cartActions.prune(catalog), [catalog]);

    // The server can't see localStorage: show nothing rather than a false "empty".
    if (!isHydrated) return <div className="min-h-240" aria-busy="true" />;

    if (sent) {
        return (
            <OrderSentPanel
                whatsAppHref={sent.whatsAppHref}
                thankYou={fillTemplate(orderingOptions.thankYou, {
                    restaurant: restaurantConfig.name,
                    name: sent.name,
                })}
                onRestore={() => {
                    cartActions.restore(sent.snapshot);
                    setSent(null);
                }}
            />
        );
    }

    if (lines.length === 0) {
        return (
            <div className="flex flex-col items-center gap-12 py-64 text-center">
                <p className="font-display text-2xl font-bold">سلتك فاضية</p>
                <p className="text-muted">اختار من القائمة وضيف يلي بدك ياه.</p>
                <Link
                    href="/menu"
                    className="mt-8 rounded-full bg-primary px-20 py-10 font-bold text-background transition-opacity hover:opacity-90"
                >
                    تصفّح القائمة
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-24 lg:grid-cols-[1fr_360px] lg:items-start">
            <ul className="flex flex-col gap-10">
                {lines.map((line) => {
                    const label = line.optionName ? `${line.name} ${line.optionName}` : line.name;

                    return (
                        <li
                            key={line.lineId}
                            className="flex flex-col gap-12 rounded-[20px] border border-border bg-surface p-12 md:p-16"
                        >
                            <div className="flex items-center gap-12">
                                <div className="relative flex size-64 shrink-0 items-center justify-center md:size-80">
                                    {line.image ? (
                                        <Image
                                            src={line.image}
                                            alt=""
                                            fill
                                            sizes="80px"
                                            className="object-contain"
                                        />
                                    ) : (
                                        <MdOutlineRestaurant aria-hidden="true" className="text-3xl text-muted/50" />
                                    )}
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-4">
                                    <h2 className="font-extrabold md:text-lg">{line.name}</h2>
                                    {line.optionName && (
                                        <p className="text-sm text-muted">{line.optionName}</p>
                                    )}
                                    <p className="text-sm font-bold text-primary tabular-nums">
                                        {formatPrice(line.lineTotal)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => cartActions.remove(line.lineId)}
                                    aria-label={`احذف ${label} من السلة`}
                                    className="flex size-36 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                                >
                                    <FiTrash2 aria-hidden="true" />
                                </button>
                            </div>

                            <div className="flex items-center gap-12">
                                <label className="min-w-0 flex-1">
                                    <span className="sr-only">ملاحظة على {label}</span>
                                    <input
                                        type="text"
                                        value={line.note ?? ""}
                                        onChange={(event) => cartActions.setNote(line.lineId, event.target.value)}
                                        maxLength={MAX_NOTE_LENGTH}
                                        placeholder="ملاحظة، متل: بدون ثوم"
                                        className="h-40 w-full rounded-full border border-border bg-background px-14 text-base placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                    />
                                </label>

                                <QuantityStepper
                                    quantity={line.quantity}
                                    onIncrement={() => cartActions.setQuantity(line.lineId, line.quantity + 1)}
                                    onDecrement={() => cartActions.setQuantity(line.lineId, line.quantity - 1)}
                                    itemLabel={label}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* =========================
                ORDER NOTE
            ========================== */}

            <label className="flex flex-col gap-8 rounded-[20px] border border-border bg-surface p-12 md:p-16 lg:col-start-1">
                <span className="font-extrabold md:text-lg">ملاحظات على الطلب</span>
                <textarea
                    value={orderNote}
                    onChange={(event) => cartActions.setOrderNote(event.target.value)}
                    maxLength={MAX_ORDER_NOTE_LENGTH}
                    rows={3}
                    placeholder="مثل: كل سندويشات الشاورما مع الحر ودبس الرمان"
                    className="w-full resize-none rounded-2xl border border-border bg-background p-12 text-base leading-relaxed placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <span className="text-end text-xs text-muted tabular-nums" aria-hidden="true">
                    {orderNote.length}/{MAX_ORDER_NOTE_LENGTH}
                </span>
            </label>

            {/* =========================
                CHECKOUT
            ========================== */}

            {/* Not sticky: the form can be taller than the screen */}
            <section
                aria-labelledby="checkout-title"
                className="flex flex-col gap-14 rounded-[20px] border border-border bg-surface p-16 lg:col-start-2 lg:row-span-2 lg:row-start-1"
            >
                <h2 id="checkout-title" className="font-display text-xl font-bold">
                    تأكيد الطلب
                </h2>
                <CheckoutForm
                    lines={lines}
                    itemCount={itemCount}
                    subtotal={subtotal}
                    orderNote={orderNote}
                    options={orderingOptions}
                    onSent={({ whatsAppHref, name }) => {
                        setSent({ whatsAppHref, name, snapshot: { lines: storedLines, note: orderNote } });
                        cartActions.clear();
                    }}
                />
            </section>
        </div>
    );
};

export default CartView;
