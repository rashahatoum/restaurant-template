"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

interface OrderSentPanelProps {
    /** The order's wa.me link, in case WhatsApp didn't open. */
    whatsAppHref: string;
    /** Thank-you text, already filled in. */
    thankYou: string;
    /** Puts the cart back as it was (the order wasn't sent after all). */
    onRestore: () => void;
    /** When set (e.g. inside a sheet on the menu), the main button calls it
        instead of linking to the menu. */
    onDone?: () => void;
}

const primaryClasses =
    "flex h-50 items-center justify-center rounded-full bg-primary font-extrabold text-background transition-opacity hover:opacity-90";

// Shown after WhatsApp opens. The cart is already empty by then; "didn't send"
// brings it back from a copy kept in memory.
const OrderSentPanel = ({ whatsAppHref, thankYou, onRestore, onDone }: OrderSentPanelProps) => {
    return (
        <div className={`mx-auto flex max-w-420 flex-col gap-14 text-center ${onDone ? "py-8" : "py-40"}`} role="status">
            <p className="font-display text-2xl font-bold">فتحنالك واتساب برسالة الطلب</p>
            <p className="leading-relaxed text-muted">{thankYou}</p>

            <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-46 items-center justify-center gap-8 rounded-full border border-primary font-bold text-primary transition-colors hover:bg-primary/10"
            >
                <FaWhatsapp aria-hidden="true" />
                ما انفتح واتساب؟ افتحه من هون
            </a>

            {onDone ? (
                <button type="button" onClick={onDone} className={primaryClasses}>
                    تمام
                </button>
            ) : (
                <Link href="/menu" className={primaryClasses}>
                    رجوع للقائمة
                </Link>
            )}

            <button
                type="button"
                onClick={onRestore}
                className="text-sm font-bold text-muted hover:text-primary"
            >
                ما بعتّ؟ رجّعلي السلة
            </button>
        </div>
    );
};

export default OrderSentPanel;
