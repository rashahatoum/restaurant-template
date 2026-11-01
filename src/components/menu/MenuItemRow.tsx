import ItemPurchase from "@/components/menu/ItemPurchase";
import DetailsHint from "@/components/ui/DetailsHint";
import type { ProductOption } from "@/types/menu";
import Image from "next/image";
import Link from "next/link";
import { FiGift } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { MdOutlineRestaurant } from "react-icons/md";

interface MenuItemRowProps {
    /** Unique id, used to group the option radios. */
    id: string;
    /** Cart reference: lib/cart productKey / offerKey. */
    itemKey: string;
    /** Details page; the photo and name link there. */
    href: string;
    name: string;
    /** Ingredients for a product, contents for an offer. */
    details: readonly string[];
    /** Dish photo on a transparent background (any ratio); a placeholder shows without it. */
    image?: string;
    price: number;
    /** Small pill next to the name, e.g. "الأكثر طلباً". */
    badge?: string;
    /** Offers: what comes free, shown as "+ … مجاناً". */
    freeItem?: string;
    isAvailable: boolean;
    /** Single-choice, price-changing options shown as a toggle (e.g. size). */
    options?: readonly ProductOption[];
    optionsLabel?: string;
}

// A compact horizontal row (photo, name, details, price, add) so several
// items fit on a phone screen. Used for products and offers alike.
// Server Component; only ItemPurchase ships JS.
const MenuItemRow = ({
    id,
    itemKey,
    href,
    name,
    details,
    image,
    price,
    badge,
    freeItem,
    isAvailable,
    options,
    optionsLabel,
}: MenuItemRowProps) => {
    return (
        <article
            className={`flex items-center gap-12 rounded-[20px] border border-border bg-surface p-12 md:gap-18 md:rounded-3xl md:p-16 ${
                isAvailable ? "" : "opacity-50"
            }`}
        >
            {/* =========================
                PHOTO (or placeholder)
            ========================== */}

            {/* Same target as the name: hidden from keyboard/screen readers to avoid a duplicate stop.
                scroll={false}: the details open as a modal, so the menu keeps its place. */}
            <Link
                href={href}
                scroll={false}
                tabIndex={-1}
                aria-hidden="true"
                className="relative isolate flex size-92 shrink-0 items-center justify-center transition-transform hover:scale-105 motion-reduce:transition-none md:size-120"
            >
                {image ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="absolute inset-[15%] -z-10 rounded-full bg-primary/30 blur-xl"
                        />
                        {/* fill + contain: square plates and 4:3 offer photos both fit.
                            alt="": the name is right next to it. */}
                        <Image
                            src={image}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 120px, 92px"
                            className="object-contain"
                        />
                    </>
                ) : (
                    <span className="flex size-[85%] items-center justify-center rounded-full border border-border bg-background text-4xl text-muted/50">
                        <MdOutlineRestaurant aria-hidden="true" />
                    </span>
                )}
            </Link>

            {/* =========================
                DETAILS
            ========================== */}

            <div className="flex min-w-0 flex-1 flex-col gap-6">
                <div className="flex flex-wrap items-center gap-6">
                    <h3 className="text-lg font-extrabold md:text-xl">
                        <Link href={href} scroll={false} className="transition-colors hover:text-primary">
                            {name}
                        </Link>
                    </h3>

                    {badge && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-8 py-2 text-xs font-bold text-primary">
                            <LuFlame aria-hidden="true" />
                            {badge}
                        </span>
                    )}
                </div>

                <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                    {details.join("، ")}
                </p>

                {freeItem && (
                    <p className="flex items-center gap-6 text-sm font-bold text-primary">
                        <FiGift aria-hidden="true" className="shrink-0" />+ {freeItem} مجاناً
                    </p>
                )}

                {/* Same target as the name: hidden from keyboard/screen readers */}
                <Link href={href} scroll={false} tabIndex={-1} aria-hidden="true" className="group self-start">
                    <DetailsHint>{freeItem ? "شو بالعرض؟" : undefined}</DetailsHint>
                </Link>

                {isAvailable ? (
                    <ItemPurchase
                        itemKey={itemKey}
                        inputName={`option-${id}`}
                        itemName={name}
                        price={price}
                        options={options}
                        optionsLabel={optionsLabel}
                    />
                ) : (
                    <span className="self-start rounded-full border border-dashed border-border px-10 py-4 text-sm font-bold text-muted">
                        غير متوفر حالياً
                    </span>
                )}
            </div>
        </article>
    );
};

export default MenuItemRow;
