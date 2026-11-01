"use client";

import { restaurantConfig } from "@/config/restaurant";
import { toWhatsAppHref } from "@/lib/contact";
import { formatPieces } from "@/lib/cart";
import { formatPrice } from "@/lib/format-price";
import { buildOrderMessage, normalizeSyrianMobile, orderTotals } from "@/lib/order";
import type { PricedCartLine } from "@/types/cart";
import type { OrderDetails, OrderingOptions } from "@/types/order";
import { useState, type FormEvent } from "react";
import { FaWhatsapp } from "react-icons/fa";

interface CheckoutFormProps {
    lines: readonly PricedCartLine[];
    itemCount: number;
    subtotal: number;
    orderNote: string;
    options: OrderingOptions;
    /** Called once WhatsApp has been opened with the order. */
    onSent: (sent: { whatsAppHref: string; name: string }) => void;
}

type OrderType = OrderDetails["type"];

const fieldClasses =
    "h-44 w-full rounded-full border border-border bg-background px-16 text-base placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const labelClasses = "flex flex-col gap-6 text-sm font-bold";

// Order type, customer details, totals and "send on WhatsApp". Native
// validation (required + a custom message for the phone); nothing typed here
// is stored. What happens after sending (empty cart, thank-you) is the parent's call.
const CheckoutForm = ({ lines, itemCount, subtotal, orderNote, options, onSent }: CheckoutFormProps) => {
    const { delivery, dineInBranches } = options;
    const types: OrderType[] = [
        ...(delivery ? (["delivery"] as const) : []),
        ...(dineInBranches.length > 0 ? (["dineIn"] as const) : []),
    ];

    const [type, setType] = useState<OrderType | undefined>(types[0]);
    const [branchId, setBranchId] = useState(dineInBranches[0]?.id);

    const branch = dineInBranches.find((candidate) => candidate.id === branchId);
    const deliveryFee = type === "delivery" && delivery ? delivery.fee : 0;
    const totals = orderTotals(subtotal, deliveryFee);

    if (!type) {
        return (
            <p className="text-center text-muted">
                الطلب أونلاين متوقف حالياً. فيك تتصل فينا مباشرة.
            </p>
        );
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const name = String(data.get("name") ?? "").trim();

        let details: OrderDetails;
        let whatsApp: string;

        if (type === "delivery" && delivery) {
            const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
            const phone = normalizeSyrianMobile(phoneInput.value);
            if (!phone) {
                phoneInput.setCustomValidity("اكتب رقم موبايل صحيح، متل 0930123456");
                form.reportValidity();
                return;
            }
            details = { type, name, phone, address: String(data.get("address") ?? "").trim() };
            whatsApp = delivery.whatsApp;
        } else if (type === "dineIn" && branch) {
            details = {
                type,
                name,
                branchName: branch.name,
                tableNumber: Number(data.get("table")),
            };
            whatsApp = branch.whatsApp;
        } else {
            return;
        }

        const message = buildOrderMessage({
            restaurantName: restaurantConfig.name,
            template: options.message,
            details,
            lines,
            orderNote,
            subtotal,
            deliveryFee,
        });
        const href = toWhatsAppHref(whatsApp, message);

        // Phones open the WhatsApp app; if a popup is blocked, the panel's link still works.
        window.open(href, "_blank", "noopener,noreferrer");
        onSent({ whatsAppHref: href, name });
    };

    /* =========================
       FORM
    ========================== */

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            {types.length > 1 && (
                <fieldset>
                    <legend className="mb-6 text-sm font-bold">نوع الطلب</legend>
                    <div className="flex rounded-full border border-border bg-background p-3">
                        {types.map((option) => (
                            <label key={option} className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value={option}
                                    checked={type === option}
                                    onChange={() => setType(option)}
                                    className="peer sr-only"
                                />
                                <span className="flex h-40 items-center justify-center rounded-full font-bold text-muted transition-colors peer-checked:bg-primary peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                                    {option === "delivery" ? "توصيل" : "طاولة"}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}

            {type === "dineIn" && (
                <div className="flex flex-col gap-16">
                    {dineInBranches.length > 1 && (
                        <label className={labelClasses}>
                            الفرع
                            <select
                                name="branch"
                                value={branchId}
                                onChange={(event) => setBranchId(event.target.value)}
                                className={`${fieldClasses} cursor-pointer`}
                            >
                                {dineInBranches.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <label className={labelClasses}>
                        رقم الطاولة
                        {/* key: resets the pick when the branch (and its table count) changes */}
                        <select key={branchId} name="table" required defaultValue="" className={`${fieldClasses} cursor-pointer`}>
                            <option value="" disabled>
                                اختر رقم الطاولة
                            </option>
                            {Array.from({ length: branch?.tableCount ?? 0 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            )}

            <label className={labelClasses}>
                الاسم
                <input name="name" required autoComplete="name" maxLength={40} className={fieldClasses} />
            </label>

            {type === "delivery" && (
                <>
                    <label className={labelClasses}>
                        رقم الموبايل
                        <input
                            name="phone"
                            type="tel"
                            required
                            inputMode="tel"
                            autoComplete="tel"
                            dir="ltr"
                            placeholder="09XX XXX XXX"
                            onInput={(event) => event.currentTarget.setCustomValidity("")}
                            className={`${fieldClasses} text-end`}
                        />
                    </label>

                    <label className={labelClasses}>
                        العنوان بالتفصيل
                        <textarea
                            name="address"
                            required
                            rows={3}
                            maxLength={200}
                            placeholder="الحي، الشارع، البناية، الطابق، وأي علامة قريبة"
                            className="w-full resize-none rounded-2xl border border-border bg-background p-12 text-base leading-relaxed placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                    </label>
                </>
            )}

            {/* =========================
                TOTALS
            ========================== */}

            <dl className="flex flex-col gap-8 border-t border-border pt-14">
                <div className="flex items-center justify-between text-muted">
                    <dt>عدد الأطعمة الشهية</dt>
                    <dd className="tabular-nums">{formatPieces(itemCount)}</dd>
                </div>
                <div className="flex items-center justify-between text-muted">
                    <dt>المجموع</dt>
                    <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
                </div>
                {type === "delivery" && (
                    <div className="flex items-center justify-between text-muted">
                        <dt>التوصيل</dt>
                        <dd className="tabular-nums">{formatPrice(totals.deliveryFee)}</dd>
                    </div>
                )}
                <div className="flex items-center justify-between text-lg font-extrabold">
                    <dt>الإجمالي</dt>
                    <dd className="text-primary tabular-nums">{formatPrice(totals.total)}</dd>
                </div>
            </dl>

            <button
                type="submit"
                className="flex h-50 items-center justify-center gap-8 rounded-full bg-primary font-extrabold text-background transition-opacity hover:opacity-90"
            >
                <FaWhatsapp aria-hidden="true" className="text-xl" />
                أرسل الطلب عالواتساب
            </button>
        </form>
    );
};

export default CheckoutForm;
