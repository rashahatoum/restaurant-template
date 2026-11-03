// Pure order logic: phone check, totals, the WhatsApp message.

import { formatPrice } from "@/lib/format-price";
import type { PricedCartLine } from "@/types/cart";
import type { OrderDetails, OrderMessageTemplate } from "@/types/order";

/**
 * Syrian mobile numbers: "0930123456", "930123456", "+963930123456",
 * "00963 930 123 456"… Returns "09XXXXXXXX", or null when invalid.
 */
export function normalizeSyrianMobile(input: string): string | null {
    const digits = input.replace(/[\s\-()]/g, "");
    const match = digits.match(/^(?:\+963|00963|0)?(9\d{8})$/);
    return match ? `0${match[1]}` : null;
}

export function orderTotals(subtotal: number, deliveryFee: number) {
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

/** Replaces {restaurant} and {name}; unknown placeholders stay as typed. */
export function fillTemplate(text: string, values: { restaurant: string; name: string }) {
    return text.replace(/\{(restaurant|name)\}/g, (_, key: "restaurant" | "name") => values[key]);
}

/** No 0/O or 1/I, so the cashier can read it out without mix-ups. */
const ORDER_REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * A short order number, e.g. "0311-1432-K7": day+month, hour+minute in the
 * restaurant's time zone, then 2 random characters. Not a counter (that needs
 * a server); the date part lets the cashier search WhatsApp for "#0311" to see
 * the day's orders. Two orders in the same minute share it 1 time in 1024.
 */
export function createOrderRef(date: Date, timeZone: string, random: () => number = Math.random): string {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", {
            timeZone,
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        })
            .formatToParts(date)
            .map((part) => [part.type, part.value])
    );
    const suffix = Array.from(
        { length: 2 },
        () => ORDER_REF_CHARS[Math.floor(random() * ORDER_REF_CHARS.length)]
    ).join("");

    return `${parts.day}${parts.month}-${parts.hour}${parts.minute}-${suffix}`;
}

interface OrderMessageInput {
    /** From createOrderRef. */
    orderRef: string;
    restaurantName: string;
    template: OrderMessageTemplate;
    details: OrderDetails;
    lines: readonly PricedCartLine[];
    orderNote: string;
    subtotal: number;
    deliveryFee: number;
}

/**
 * The text sent to the restaurant. Greeting and closing come from the
 * dashboard; the middle is fixed so the cashier always reads the same layout.
 */
export function buildOrderMessage({
    orderRef,
    restaurantName,
    template,
    details,
    lines,
    orderNote,
    subtotal,
    deliveryFee,
}: OrderMessageInput): string {
    const fill = (text: string) => fillTemplate(text, { restaurant: restaurantName, name: details.name });
    const totals = orderTotals(subtotal, deliveryFee);

    // Inside a left-to-right isolate (U+2066 … U+2069): in an Arabic line, the
    // letters after the digits would otherwise be reordered ("K7-0311-1432").
    const orderLine = `رقم الطلب: ⁦#${orderRef}⁩`;

    const customer =
        details.type === "delivery"
            ? [
                  orderLine,
                  "نوع الطلب: توصيل",
                  `الاسم: ${details.name}`,
                  `الهاتف: ${details.phone}`,
                  `العنوان: ${details.address}`,
              ]
            : [
                  orderLine,
                  "نوع الطلب: طاولة",
                  `الفرع: ${details.branchName}`,
                  `رقم الطاولة: ${details.tableNumber}`,
                  `الاسم: ${details.name}`,
              ];

    const items = lines.flatMap((line) => [
        `- ${line.quantity} × ${line.name}${line.optionName ? ` (${line.optionName})` : ""} = ${formatPrice(line.lineTotal)}`,
        ...(line.note ? [`  ملاحظة: ${line.note}`] : []),
    ]);

    const bill = [
        `المجموع: ${formatPrice(totals.subtotal)}`,
        ...(details.type === "delivery" ? [`التوصيل: ${formatPrice(totals.deliveryFee)}`] : []),
        `الإجمالي: ${formatPrice(totals.total)}`,
    ];

    const blocks = [
        fill(template.greeting).trim(),
        customer.join("\n"),
        ["الطلب:", ...items].join("\n"),
        orderNote.trim() ? `ملاحظات على الطلب: ${orderNote.trim()}` : "",
        bill.join("\n"),
        fill(template.closing).trim(),
    ];

    return blocks.filter(Boolean).join("\n\n");
}
