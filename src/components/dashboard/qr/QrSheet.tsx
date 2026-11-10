import { qrSvg } from "@/lib/qr";
import Image from "next/image";

export interface QrCard {
    /** "طاولة 5" or "قائمة الطعام". */
    title: string;
    /** Under the call to action: the branch, or the address. */
    subtitle: string;
    cta: string;
    /** Absolute URL inside the code. */
    link: string;
}

interface QrSheetProps {
    cards: readonly QrCard[];
    restaurantName: string;
    /** Fixed print colours (paper is white whatever the dashboard theme). */
    colors: { ink: string; accent: string };
    /** "cards": two per A4 page, one above the other (tables; cut in half → A5). "poster": one card filling the page (menu). */
    layout?: "cards" | "poster";
}

const CARDS_PER_PAGE = 2;

// A4 pages of QR cards. Server Component: the codes are SVG made here.
// Pages are cut here (not left to the browser), each starts a new sheet, and
// sizes leave room in the 277mm printable height: 2 × 132mm + 6mm = 270mm.
// Each page looks like paper on screen too, so what you see is what prints.
const QrSheet = async ({ cards, restaurantName, colors, layout = "cards" }: QrSheetProps) => {
    const codes = await Promise.all(cards.map((card) => qrSvg(card.link, { dark: colors.ink, light: "#ffffff" })));
    const isPoster = layout === "poster";
    const pages = Array.from({ length: Math.ceil(cards.length / CARDS_PER_PAGE) }, (_, page) =>
        cards.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE).map((card, index) => ({ card, code: codes[page * CARDS_PER_PAGE + index] }))
    );

    return (
        <>
            {/* Page size and margins for the browser's print dialog */}
            <style>{"@page { size: A4; margin: 10mm; }"}</style>
            <div className="flex flex-col items-center gap-24 print:block">
                {pages.map((items, page) => (
                    <section
                        key={page}
                        aria-label={pages.length > 1 ? `ورقة ${page + 1} من ${pages.length}` : undefined}
                        style={{ color: colors.ink }}
                        className={`w-full max-w-[200mm] rounded-2xl bg-white p-[5mm] print:max-w-none print:rounded-none print:p-0 ${
                            page < pages.length - 1 ? "break-after-page" : ""
                        } ${isPoster ? "" : "flex flex-col gap-[6mm]"}`}
                    >
                        {items.map(({ card, code }) => (
                            <article
                                key={card.link}
                                style={{ borderColor: colors.accent }}
                                className={`flex break-inside-avoid flex-col items-center justify-center rounded-[6mm] border-[1.5px] [print-color-adjust:exact] ${
                                    isPoster ? "min-h-[200mm] gap-[5mm] p-[10mm] print:h-[265mm]" : "min-h-[120mm] gap-[3mm] p-[5mm] print:h-[132mm]"
                                }`}
                            >
                                <header className={`flex items-center font-extrabold ${isPoster ? "gap-[4mm] text-[22pt]" : "gap-[3mm] text-[15pt]"}`}>
                                    <Image
                                        src="/icon.png"
                                        alt=""
                                        width={isPoster ? 64 : 40}
                                        height={isPoster ? 64 : 40}
                                        unoptimized
                                        className={isPoster ? "size-[14mm] rounded-[3mm]" : "size-[10mm] rounded-[2mm]"}
                                    />
                                    {restaurantName}
                                </header>
                                <h2 style={{ color: colors.accent }} className={`leading-tight font-extrabold ${isPoster ? "text-[40pt]" : "text-[30pt]"}`}>
                                    {card.title}
                                </h2>
                                {/* SVG from the qrcode library (our own link), not user HTML */}
                                <div
                                    aria-hidden="true"
                                    className={`aspect-square max-w-full [&_svg]:size-full ${isPoster ? "w-[120mm]" : "w-[70mm]"}`}
                                    dangerouslySetInnerHTML={{ __html: code }}
                                />
                                <p className={`font-extrabold ${isPoster ? "text-[22pt]" : "text-[16pt]"}`}>{card.cta}</p>
                                <p dir="auto" className={`opacity-70 ${isPoster ? "text-[14pt]" : "text-[11pt]"}`}>
                                    {card.subtitle}
                                </p>
                            </article>
                        ))}
                    </section>
                ))}
            </div>
        </>
    );
};

export default QrSheet;
