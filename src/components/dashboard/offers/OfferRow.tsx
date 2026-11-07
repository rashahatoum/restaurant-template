import DashboardImage from "@/components/dashboard/DashboardImage";
import Switch from "@/components/dashboard/Switch";
import { formatPrice } from "@/lib/format-price";
import type { Offer } from "@/types/content";
import Link from "next/link";
import { FiArrowDown, FiArrowUp, FiChevronLeft, FiGift, FiTrash2 } from "react-icons/fi";

interface OfferRowProps {
    offer: Offer;
    /** 0-based place in the order (first can't go up, last can't go down). */
    index: number;
    total: number;
    onToggle: (isActive: boolean) => void;
    onMove: (direction: "up" | "down") => void;
    /** Asks first (the parent shows the confirm dialog). */
    onDelete: () => void;
}

const iconButton =
    "flex size-40 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30";

// One offer in the list: photo, what it is, on/off, its place and delete.
// Everything else opens the form. Hook-free.
const OfferRow = ({ offer, index, total, onToggle, onMove, onDelete }: OfferRowProps) => {
    const { id, title, items, freeItem, price, image, imageStyle, badge, isActive } = offer;

    return (
        <article
            className={`flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12 transition-opacity md:flex-row md:items-center ${
                isActive ? "" : "opacity-60"
            }`}
        >
            <div className="flex min-w-0 flex-1 items-start gap-12">
                <div className="relative size-64 shrink-0">
                    <DashboardImage
                        src={image}
                        sizes="64px"
                        className={imageStyle === "photo" ? "rounded-xl object-cover" : "object-contain"}
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <h3 className="flex flex-wrap items-baseline gap-x-6 text-base leading-snug font-extrabold">
                        <Link
                            href={`/dashboard/offers/${id}`}
                            className="inline-flex items-center gap-4 underline-offset-4 transition-colors hover:text-primary hover:underline"
                        >
                            {title}
                            <FiChevronLeft aria-hidden="true" className="text-sm text-muted ltr:rotate-180" />
                        </Link>
                        {badge && <span className="text-xs font-bold text-primary">{badge}</span>}
                    </h3>
                    <p className="truncate text-sm text-muted">{items.join(" • ")}</p>
                    <p className="flex flex-wrap items-center gap-x-10 gap-y-2 text-sm">
                        <span className="inline-flex items-center gap-4 font-bold text-primary">
                            <FiGift aria-hidden="true" />
                            {freeItem} مجاناً
                        </span>
                        <span className="font-extrabold tabular-nums">{formatPrice(price)}</span>
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-6 md:justify-end">
                <Switch checked={isActive} onChange={onToggle} label="فعّال" />
                <div className="flex items-center gap-6">
                    <button type="button" onClick={() => onMove("up")} disabled={index === 0} aria-label={`طلّع ${title} لفوق`} className={iconButton}>
                        <FiArrowUp aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove("down")}
                        disabled={index === total - 1}
                        aria-label={`نزّل ${title} لتحت`}
                        className={iconButton}
                    >
                        <FiArrowDown aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label={`احذف ${title}`}
                        className={`${iconButton} hover:border-danger hover:text-danger`}
                    >
                        <FiTrash2 aria-hidden="true" />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default OfferRow;
