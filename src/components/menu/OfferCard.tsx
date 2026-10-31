import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiGift } from "react-icons/fi";

interface OfferCardProps {
    title: string;
    /** What the customer buys. */
    items: readonly string[];
    /** What they get for free. */
    freeItem: string;
    price: number;
    /** 4:3 photo on a transparent background; it pops out of the card top. */
    image: string;
    badge?: string;
    /** The action button's target. */
    href: string;
    actionLabel?: string;
    /** Details page; the photo and title link there. */
    detailsHref?: string;
}

// "Ticket" card: photo overlapping the top edge, a FREE sticker,
// a perforated line, then price + action. The parent sets the width.
const OfferCard = ({
    title,
    items,
    freeItem,
    price,
    image,
    badge,
    href,
    actionLabel = "اطلب العرض",
    detailsHref,
}: OfferCardProps) => {
    const photo = (
        <Image
            src={image}
            alt={title}
            width={800}
            height={600}
            sizes="(min-width: 768px) 30vw, 75vw"
            className="h-auto w-full drop-shadow-[0_16px_24px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:-translate-y-6 motion-reduce:transition-none"
        />
    );

    return (
        <article className="group relative w-full">
            {/* Photo, above the card body. Linked like the title (one keyboard stop: the title). */}
            <div className="relative z-10 px-12">
                {detailsHref ? (
                    <Link href={detailsHref} scroll={false} tabIndex={-1} aria-hidden="true" className="block">
                        {photo}
                    </Link>
                ) : (
                    photo
                )}
            </div>

            {/* Card body slides up behind the photo (negative margin), text starts below it */}
            <div className="relative -mt-[28%] rounded-3xl border border-primary/20 bg-surface pt-[30%] shadow-[0_24px_60px_-30px_var(--color-primary)]">
                {/* FREE sticker on the top corner */}
                <span className="absolute -top-28 inset-e-12 z-20 flex size-64 rotate-12 flex-col items-center justify-center rounded-full bg-primary text-background shadow-lg md:size-72">
                    <FiGift aria-hidden="true" className="text-lg" />
                    <span className="text-xs font-extrabold md:text-sm">مجاناً</span>
                </span>

                {badge && (
                    <div className="absolute -top-20 inset-s-12 z-20">
                        <Badge>{badge}</Badge>
                    </div>
                )}

                {/* What you buy + what you get */}
                <div className="flex flex-col items-center gap-8 px-20 pb-20 pt-12 text-center">
                    <h3 className="font-display text-2xl font-bold lg:text-3xl">
                        {detailsHref ? (
                            <Link href={detailsHref} scroll={false} className="transition-colors hover:text-primary">
                                {title}
                            </Link>
                        ) : (
                            title
                        )}
                    </h3>

                    <p className="text-sm text-muted lg:text-base">
                        {items.join(" • ")}
                    </p>

                    <p className="flex items-center gap-6 font-bold text-primary lg:text-lg">
                        <FiGift aria-hidden="true" className="shrink-0" />+{" "}
                        {freeItem} مجاناً
                    </p>
                </div>

                {/* Perforation: dashed line with orange notches on both edges */}
                <div aria-hidden="true" className="relative">
                    <div className="mx-20 border-t-2 border-dashed border-foreground/15" />
                    <span className="absolute -top-12 -inset-s-12 size-24 rounded-full bg-primary" />
                    <span className="absolute -top-12 -inset-e-12 size-24 rounded-full bg-primary" />
                </div>

                {/* Price + action */}
                <div className="flex items-center justify-between gap-12 px-20 py-16">
                    <p className="text-xl font-extrabold text-primary lg:text-2xl">
                        {formatPrice(price)}
                    </p>

                    <Link
                        href={href}
                        className="flex shrink-0 items-center gap-6 rounded-full bg-primary px-16 py-8 text-sm font-bold text-background transition-all duration-300 hover:brightness-110"
                    >
                        {actionLabel}
                        <FiArrowLeft aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default OfferCard;
