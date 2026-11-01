import ItemPurchase from "@/components/menu/ItemPurchase";
import type { MenuItemDetails } from "@/types/menu";
import Image from "next/image";
import type { CSSProperties } from "react";
import { FiGift } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { MdOutlineRestaurant } from "react-icons/md";

interface ItemDetailsProps {
    item: MenuItemDetails;
    /** h1 on the standalone page, h2 inside the modal. */
    headingLevel: "h1" | "h2";
    /** Lets a dialog point aria-labelledby at the name. */
    headingId?: string;
    /** Standalone page only: the photo is the page's main image. */
    preloadImage?: boolean;
    /**
     * "full": name, photo, parts, description, size and add (standalone page).
     * "focus": photo, parts, size and add; name kept for screen readers (modal).
     */
    variant?: "full" | "focus";
}

/* =========================
   STAGE GEOMETRY
   Photo and labels share one box with a fixed aspect ratio, so the arrows
   can be computed: each starts on the plate's rim, facing its label, and
   bends down onto it. Units are the SVG viewBox; positions are written in
   LTR terms and the whole stage mirrors in RTL.
========================= */

interface Stage {
    width: number;
    height: number;
    /** The photo's square box; the plate is the circle inside it. */
    plate: { cx: number; cy: number; r: number };
    /** Label rows (y of the label's top edge). Two rows stagger crowded parts. */
    rows: readonly number[];
    /** Above this many parts, use both rows. */
    singleRowMax: number;
    strokeWidth: number;
}

const PHONE: Stage = {
    width: 1000,
    height: 1300,
    plate: { cx: 500, cy: 400, r: 330 },
    rows: [1010, 1190],
    singleRowMax: 3,
    strokeWidth: 9,
};

const WIDE: Stage = {
    width: 1600,
    height: 900,
    plate: { cx: 800, cy: 340, r: 300 },
    rows: [790, 790],
    singleRowMax: 6,
    strokeWidth: 6,
};

/** Timing, in ms. Photo and labels are there at once; the arrows draw one by
    one, all starting within ARROWS_SPAN whatever the number of parts. */
const ARROW_START = 150;
const ARROWS_SPAN = 400;
const ARROW_HEAD_DELAY = 250;

const arrowStart = (index: number, count: number) =>
    ARROW_START + (count > 1 ? Math.round((index * ARROWS_SPAN) / (count - 1)) : 0);

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
const pct = (value: number, total: number) => `${(value / total) * 100}%`;

/** Where each part's label sits (center x, top y) on a stage. */
function labelSpots(stage: Stage, count: number) {
    const stagger = count > stage.singleRowMax;
    return Array.from({ length: count }, (_, index) => ({
        x: ((index + 0.5) / count) * stage.width,
        y: stage.rows[stagger ? index % 2 : stage.rows.length - 1],
        /** Room for the text: staggered labels can use two slots. */
        width: ((stagger ? 2 : 1) / count) * stage.width,
    }));
}

/** From the rim, facing the label, then curving down onto it. */
function arrowPaths(stage: Stage, end: { x: number; y: number }) {
    const { cx, cy, r } = stage.plate;
    const tipY = end.y - 18;
    const length = Math.hypot(end.x - cx, tipY - cy);
    const ux = (end.x - cx) / length;
    const uy = (tipY - cy) / length;

    const sx = cx + ux * (r + 12);
    const sy = cy + uy * (r + 12);
    const reach = Math.min(140, (tipY - sy) * 0.6);
    const round = (n: number) => Math.round(n);

    const head = 26;
    return {
        line: `M${round(sx)} ${round(sy)} C ${round(sx + ux * reach)} ${round(sy + uy * reach)}, ${round(end.x)} ${round(tipY - reach)}, ${round(end.x)} ${round(tipY)}`,
        head: `M${round(end.x - head)} ${round(tipY - head)} L${round(end.x)} ${round(tipY)} L${round(end.x + head)} ${round(tipY - head)}`,
    };
}

const StageArrows = ({ stage, count, className }: { stage: Stage; count: number; className: string }) => (
    <svg
        aria-hidden="true"
        viewBox={`0 0 ${stage.width} ${stage.height}`}
        className={`pointer-events-none absolute inset-0 size-full text-primary rtl:-scale-x-100 ${className}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={stage.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {labelSpots(stage, count).map((spot, index) => {
            const { line, head } = arrowPaths(stage, spot);
            const startMs = arrowStart(index, count);
            return (
                <g key={index}>
                    <path pathLength={100} d={line} className="arrow-draw" style={delay(startMs)} />
                    <path pathLength={100} d={head} className="arrow-draw" style={delay(startMs + ARROW_HEAD_DELAY)} />
                </g>
            );
        })}
    </svg>
);

// Product or offer details, laid out to fit one screen: name, then a stage
// with the photo and an orange arrow from the plate down to each ingredient
// (or offer content), then description, size and add. The stage keeps its
// aspect ratio and scales to the height that's left (container query units).
// Server Component; animations are CSS, so only the purchase controls ship JS.
const ItemDetails = ({
    item,
    headingLevel: Heading,
    headingId,
    preloadImage,
    variant = "full",
}: ItemDetailsProps) => {
    const isFocus = variant === "focus";
    const parts = [
        ...item.parts.map((label) => ({ label, isGift: false })),
        ...(item.freeItem ? [{ label: `${item.freeItem} مجاناً`, isGift: true }] : []),
    ];
    const phoneSpots = labelSpots(PHONE, parts.length);
    const wideSpots = labelSpots(WIDE, parts.length);

    const plateBox = (stage: Stage) => {
        const { cx, cy, r } = stage.plate;
        return {
            insetInlineStart: pct(cx - r, stage.width),
            top: pct(cy - r, stage.height),
            width: pct(r * 2, stage.width),
            height: pct(r * 2, stage.height),
        };
    };
    const phonePlate = plateBox(PHONE);
    const widePlate = plateBox(WIDE);

    return (
        <article className="flex h-full min-h-0 w-full flex-col items-center gap-8 md:gap-12">
            {/* =========================
                NAME
            ========================== */}

            <header className={isFocus ? "sr-only" : "flex shrink-0 flex-col items-center gap-6 px-48 text-center"}>
                {item.badge && (
                    <span className="inline-flex items-center gap-4 rounded-full bg-primary/15 px-10 py-3 text-xs font-bold text-primary">
                        <LuFlame aria-hidden="true" />
                        {item.badge}
                    </span>
                )}
                <Heading id={headingId} className="font-display text-2xl font-bold md:text-4xl">
                    {item.name}
                </Heading>
            </header>

            {/* =========================
                STAGE: photo + arrows + labels
            ========================== */}

            {/* Centered in the height that's left (phones are usually limited by width) */}
            <div className="flex min-h-0 w-full flex-1 items-center [container-type:size]">
                <div className="relative mx-auto aspect-[10/13] w-[min(100cqw,calc(100cqh*10/13))] md:aspect-[16/9] md:w-[min(100cqw,calc(100cqh*16/9))]">
                    {/* Photo box, positioned per stage */}
                    <div
                        style={
                            {
                                "--plate-s": phonePlate.insetInlineStart,
                                "--plate-t": phonePlate.top,
                                "--plate-w": phonePlate.width,
                                "--plate-h": phonePlate.height,
                                "--wide-plate-s": widePlate.insetInlineStart,
                                "--wide-plate-t": widePlate.top,
                                "--wide-plate-w": widePlate.width,
                                "--wide-plate-h": widePlate.height,
                            } as CSSProperties
                        }
                        className="absolute isolate inset-s-(--plate-s) top-(--plate-t) h-(--plate-h) w-(--plate-w) md:inset-s-(--wide-plate-s) md:top-(--wide-plate-t) md:h-(--wide-plate-h) md:w-(--wide-plate-w)"
                    >
                        {!isFocus && (
                            <span aria-hidden="true" className="absolute inset-[8%] -z-10 rounded-full bg-primary/35 blur-3xl" />
                        )}
                        {/* Own wrapper: the float animates `translate`, the box above uses `inset`/`top` */}
                        <div className="dish-float absolute inset-0">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    preload={preloadImage}
                                    sizes="(min-width: 768px) 420px, 66vw"
                                    className="object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/0.55)]"
                                />
                            ) : (
                                <MdOutlineRestaurant
                                    aria-hidden="true"
                                    className="absolute inset-0 m-auto size-1/2 text-muted/40"
                                />
                            )}
                        </div>
                    </div>

                    {parts.length > 0 && (
                        <>
                            <StageArrows stage={PHONE} count={parts.length} className="md:hidden" />
                            <StageArrows stage={WIDE} count={parts.length} className="hidden md:block" />

                            <h3 className="sr-only">{item.kind === "offer" ? "محتوى العرض" : "المكونات"}</h3>
                            <ol>
                                {parts.map((part, index) => {
                                    const phone = phoneSpots[index];
                                    const wide = wideSpots[index];
                                    const spot = {
                                        "--x": pct(phone.x, PHONE.width),
                                        "--y": pct(phone.y, PHONE.height),
                                        "--w": pct(phone.width, PHONE.width),
                                        "--wide-x": pct(wide.x, WIDE.width),
                                        "--wide-y": pct(wide.y, WIDE.height),
                                        "--wide-w": pct(wide.width, WIDE.width),
                                    } as CSSProperties;

                                    return (
                                        <li
                                            key={`${part.label}-${index}`}
                                            style={spot}
                                            // Centered on its arrow: inset-s + a half-width shift (flipped in RTL).
                                            className={`absolute inset-s-(--x) top-(--y) w-(--w) -translate-x-1/2 px-4 text-center text-sm leading-snug font-extrabold [text-shadow:0_2px_10px_rgb(0_0_0/0.9)] rtl:translate-x-1/2 md:inset-s-(--wide-x) md:top-(--wide-y) md:w-(--wide-w) md:text-lg ${
                                                part.isGift ? "text-primary" : "text-foreground"
                                            }`}
                                        >
                                            <span className="flex items-start justify-center gap-4">
                                                {part.isGift && <FiGift aria-hidden="true" className="mt-3 shrink-0" />}
                                                <span className="line-clamp-2">{part.label}</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </>
                    )}
                </div>
            </div>

            {/* =========================
                DESCRIPTION + ORDER
            ========================== */}

            {!isFocus && item.description && (
                // Dropped on short screens so everything fits without scrolling
                <p className="line-clamp-2 max-w-560 shrink-0 text-center text-sm leading-relaxed text-muted md:text-base [@media(max-height:680px)]:hidden">
                    {item.description}
                </p>
            )}

            <div className="flex w-full max-w-360 shrink-0 flex-col gap-8 [text-shadow:0_2px_10px_rgb(0_0_0/0.9)] md:max-w-none md:flex-row md:items-center md:justify-center md:gap-24 md:*:min-w-200">
                {item.isAvailable ? (
                    <ItemPurchase
                        itemKey={item.itemKey}
                        inputName={`details-option-${item.id}`}
                        itemName={item.name}
                        price={item.price}
                        options={item.options}
                        optionsLabel={item.optionsLabel}
                    />
                ) : (
                    <span className="self-center rounded-full border border-dashed border-border px-14 py-6 font-bold text-muted">
                        غير متوفر حالياً
                    </span>
                )}
            </div>
        </article>
    );
};

export default ItemDetails;
