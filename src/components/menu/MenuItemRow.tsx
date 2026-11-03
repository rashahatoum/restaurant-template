import ItemPurchase from "@/components/menu/ItemPurchase";
import type { ImageStyle, ProductOption } from "@/types/menu";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiGift } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { MdOutlineRestaurant } from "react-icons/md";

interface MenuItemRowProps {
    /** Unique id, used to group the option radios. */
    id: string;
    /** Cart reference: lib/cart productKey / offerKey. */
    itemKey: string;
    /** Details page; the whole row links there. */
    href: string;
    name: string;
    /** Ingredients for a product, contents for an offer. */
    details: readonly string[];
    /** Dish photo on a transparent background (any ratio); a placeholder shows without it. */
    image?: string;
    /** "photo": a full photo, shown as a rounded square. */
    imageStyle?: ImageStyle;
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

// Photo | name, details, price | add. Then the size toggle across the row.
// Empty areas (no details, no gift) collapse, since rows have no gap.
// ItemPurchase fills `price`, `size` and `add` (it renders a fragment).
const grid: CSSProperties = {
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gridTemplateAreas: `"photo name add" "photo details add" "photo gift add" "photo price add" "size size size"`,
};

// A compact row so five or so items fit on a phone screen (owner). Used for
// products and offers alike. The name's link stretches over the whole row;
// the controls sit above it (relative z-10, in ItemPurchase).
// Server Component; only ItemPurchase ships JS.
const MenuItemRow = ({
    id,
    itemKey,
    href,
    name,
    details,
    image,
    imageStyle,
    price,
    badge,
    freeItem,
    isAvailable,
    options,
    optionsLabel,
}: MenuItemRowProps) => {
    return (
        <article
            style={grid}
            className={`group relative grid items-center gap-x-10 rounded-2xl border border-border bg-surface p-10 transition-colors hover:border-primary/60 md:gap-x-14 md:rounded-3xl md:p-14 ${
                isAvailable ? "" : "opacity-50"
            }`}
        >
            {/* =========================
                PHOTO (or placeholder)
            ========================== */}

            <div className="relative isolate flex size-64 items-center justify-center self-center [grid-area:photo] md:size-96">
                {image && imageStyle === "photo" ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 96px, 64px"
                        className="rounded-xl object-cover"
                    />
                ) : image ? (
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
                            sizes="(min-width: 768px) 96px, 64px"
                            className="object-contain transition-transform group-hover:scale-105 motion-reduce:transition-none"
                        />
                    </>
                ) : (
                    <span className="flex size-[85%] items-center justify-center rounded-full border border-border bg-background text-2xl text-muted/50 md:text-3xl">
                        <MdOutlineRestaurant aria-hidden="true" />
                    </span>
                )}
            </div>

            {/* =========================
                NAME, DETAILS, GIFT
            ========================== */}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 [grid-area:name]">
                <h3 className="text-base leading-snug font-extrabold md:text-lg">
                    {/* Stretched link: the whole row opens the details (as a modal, so the
                        menu keeps its place). One link, one tab stop. */}
                    <Link
                        href={href}
                        scroll={false}
                        className="transition-colors after:absolute after:inset-0 after:rounded-[inherit] hover:text-primary focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                    >
                        {name}
                    </Link>
                </h3>

                {badge && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-6 py-1 text-[11px] font-bold text-primary">
                        <LuFlame aria-hidden="true" />
                        {badge}
                    </span>
                )}
            </div>

            {/* Drinks and simple items have no details: the area collapses */}
            {details.length > 0 && (
                <p className="mt-2 truncate text-xs leading-relaxed text-muted [grid-area:details] md:text-sm">
                    {details.join("، ")}
                </p>
            )}

            {freeItem && (
                <p className="mt-2 flex items-center gap-4 text-xs font-bold text-primary [grid-area:gift] md:text-sm">
                    <FiGift aria-hidden="true" className="shrink-0" />+ {freeItem} مجاناً
                </p>
            )}

            {/* =========================
                PRICE, SIZE, ADD
            ========================== */}

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
                <span className="rounded-full border border-dashed border-border px-8 py-3 text-xs font-bold text-muted [grid-area:add]">
                    غير متوفر
                </span>
            )}
        </article>
    );
};

export default MenuItemRow;
