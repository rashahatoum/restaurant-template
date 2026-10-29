import type { ContentImage } from "@/types/content";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

interface MenuBannerSlideProps {
    eyebrow?: string;
    /** Typed line breaks are kept. */
    title: string;
    /** Dish photo on a transparent background. */
    image: ContentImage;
    /** Full-bleed brand texture behind the slide. */
    background: string;
    action?: { label: string; href: string };
    /** Set on the first slide only: it is visible on load. */
    preload?: boolean;
}

// One banner slide: text on the start side over a darkened brand background,
// the dish on the end side. Server Component, props only.
const MenuBannerSlide = ({
    eyebrow,
    title,
    image,
    background,
    action,
    preload = false,
}: MenuBannerSlideProps) => {
    return (
        <div className="relative isolate h-184 overflow-hidden rounded-[20px] border border-border bg-surface md:h-300 md:rounded-[28px] lg:h-340">
            <Image
                src={background}
                alt=""
                fill
                preload={preload}
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="-z-20 object-cover opacity-55"
            />

            {/* Darkens the start side so the text stays readable */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-linear-to-l from-background/90 via-background/60 to-background/5 ltr:bg-linear-to-r"
            />

            <div className="absolute inset-y-0 inset-e-0 w-[48%] md:inset-e-[5%] md:w-2/5">
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    preload={preload}
                    sizes="(min-width: 768px) 40vw, 50vw"
                    className="object-contain drop-shadow-[0_16px_24px_rgb(0_0_0/0.5)]"
                />
            </div>

            {/* Phones: the text column stops before the dish (52% + 48%) */}
            <div className="relative flex h-full w-[52%] flex-col items-start justify-center gap-6 ps-16 md:w-1/2 md:gap-14 md:ps-56">
                {eyebrow && (
                    <span className="text-xs font-bold text-primary md:text-base">
                        {eyebrow}
                    </span>
                )}

                <p className="whitespace-pre-line font-display text-xl font-bold leading-snug md:text-4xl lg:text-5xl">
                    {title}
                </p>

                {action && (
                    <Link
                        href={action.href}
                        className="mt-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-10 py-4 text-xs font-extrabold text-background transition-opacity hover:opacity-90 md:mt-6 md:gap-4 md:px-22 md:py-12 md:text-base"
                    >
                        {action.label}
                        <FiChevronLeft aria-hidden="true" className="text-sm ltr:rotate-180 md:text-base" />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default MenuBannerSlide;
