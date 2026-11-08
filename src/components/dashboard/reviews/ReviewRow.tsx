import Switch from "@/components/dashboard/Switch";
import { toPlainText } from "@/lib/highlight";
import type { Review } from "@/types/content";
import Link from "next/link";
import { FiArrowDown, FiArrowUp, FiChevronLeft, FiTrash2 } from "react-icons/fi";

interface ReviewRowProps {
    review: Review;
    /** 0-based place in the order (first can't go up, last can't go down). */
    index: number;
    total: number;
    onToggle: (isVisible: boolean) => void;
    onMove: (direction: "up" | "down") => void;
    /** Asks first (the parent shows the confirm dialog). */
    onDelete: () => void;
}

const iconButton =
    "flex size-40 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30";

// One review in the list: who, what they said, shown or not, its place and
// delete. Everything else opens the form. Hook-free.
const ReviewRow = ({ review, index, total, onToggle, onMove, onDelete }: ReviewRowProps) => {
    const { id, customerName, answer, time, isVisible } = review;
    const name = `رأي ${customerName}`;

    return (
        <article
            className={`flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12 transition-opacity md:flex-row md:items-center ${
                isVisible ? "" : "opacity-60"
            }`}
        >
            <div className="flex min-w-0 flex-1 items-start gap-12">
                {/* Same initial disc as the card's chat header */}
                <span
                    aria-hidden="true"
                    className="flex size-44 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-background"
                >
                    {customerName.charAt(0)}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <h3 className="flex flex-wrap items-baseline gap-x-8 text-base leading-snug font-extrabold">
                        <Link
                            href={`/dashboard/reviews/${id}`}
                            aria-label={`عدّل ${name}`}
                            className="inline-flex items-center gap-4 underline-offset-4 transition-colors hover:text-primary hover:underline"
                        >
                            {customerName}
                            <FiChevronLeft aria-hidden="true" className="text-sm text-muted ltr:rotate-180" />
                        </Link>
                        {time && <span className="text-xs font-normal text-muted">{time}</span>}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted">{toPlainText(answer)}</p>
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-6 md:justify-end">
                <Switch checked={isVisible} onChange={onToggle} label="ظاهر" />
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
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label={`احذف ${name}`}
                        className={`${iconButton} hover:border-danger hover:text-danger`}
                    >
                        <FiTrash2 aria-hidden="true" />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ReviewRow;
