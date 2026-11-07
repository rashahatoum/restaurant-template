import DashboardImage from "@/components/dashboard/DashboardImage";
import { formatPrice } from "@/lib/format-price";
import type { Product } from "@/types/menu";
import Link from "next/link";
import { FiArrowDown, FiArrowUp, FiChevronLeft, FiInfo } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

interface BestSellerRowProps {
    product: Product;
    /** 0-based place in the slider (first can't go up, last can't go down). */
    index: number;
    total: number;
    onMove: (direction: "up" | "down") => void;
    onRemove: () => void;
}

const iconButton =
    "flex size-40 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30";

// One best seller: its place, photo, name and price, why it's hidden from the
// slider when it is, move and remove. The name opens the product form. Hook-free.
const BestSellerRow = ({ product, index, total, onMove, onRemove }: BestSellerRowProps) => {
    const { id, name, image, imageStyle, price, isAvailable } = product;
    // services/menu getBestSellers shows available products with a photo only
    const hiddenBecause = !image ? "ما إله صورة" : !isAvailable ? "مش متوفر هلق" : undefined;

    return (
        <article
            className={`flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12 transition-opacity md:flex-row md:items-center ${
                hiddenBecause ? "opacity-60" : ""
            }`}
        >
            <div className="flex min-w-0 flex-1 items-center gap-12">
                <span aria-hidden="true" className="flex size-32 shrink-0 items-center justify-center rounded-full bg-background text-sm font-extrabold text-muted tabular-nums">
                    {index + 1}
                </span>

                <div className="relative size-56 shrink-0">
                    <DashboardImage
                        src={image}
                        sizes="56px"
                        className={imageStyle === "photo" ? "rounded-xl object-cover" : "object-contain"}
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <h3 className="text-base leading-snug font-extrabold">
                        <Link
                            href={`/dashboard/menu/${id}`}
                            className="inline-flex items-center gap-4 underline-offset-4 transition-colors hover:text-primary hover:underline"
                        >
                            {name}
                            <FiChevronLeft aria-hidden="true" className="text-sm text-muted ltr:rotate-180" />
                        </Link>
                    </h3>
                    <p className="text-sm font-bold tabular-nums text-muted">{formatPrice(price)}</p>
                    {hiddenBecause && (
                        <p className="flex items-center gap-4 text-xs font-bold text-muted">
                            <FiInfo aria-hidden="true" className="shrink-0" />
                            {hiddenBecause}، فما بيطلع بالسلايدر
                        </p>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-6 md:justify-end">
                <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex h-36 items-center gap-6 rounded-full border border-primary/50 bg-primary/15 px-12 text-sm font-bold text-primary transition-colors hover:border-danger hover:bg-danger/10 hover:text-danger"
                >
                    <FaStar aria-hidden="true" />
                    شيل من الأكثر مبيعاً
                </button>
                <div className="flex items-center gap-6">
                    <button type="button" onClick={() => onMove("up")} disabled={index === 0} aria-label={`قدّم ${name}`} className={iconButton}>
                        <FiArrowUp aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove("down")}
                        disabled={index === total - 1}
                        aria-label={`أخّر ${name}`}
                        className={iconButton}
                    >
                        <FiArrowDown aria-hidden="true" />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default BestSellerRow;
