import { restaurantConfig } from "@/config/restaurant";
import type { FeatureIconKey } from "@/types/config";
import { getImageProps } from "next/image";
import Link from "next/link";

import type { IconType } from "react-icons";
import { FiArrowLeft, FiAward, FiUser } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { TiFeather } from "react-icons/ti";

import HeroSpit from "@/components/motion/HeroSpit";
import Underline from "@/components/ui/Underline";

/* =========================
   FEATURE ICONS
========================= */

const featureIcons: Record<FeatureIconKey, IconType> = {
    fresh: TiFeather,
    fire: LuFlame,
    quality: FiAward,
};

// Shared by both hero CTAs; each adds its own colors (incl. border color,
// so both buttons are the same height).
const actionClasses = `
    flex
    w-full
    items-center
    justify-center
    gap-8
    rounded-full
    border-2
    px-20
    py-10
    text-sm
    font-bold
    transition-all
    duration-300
    hover:-translate-y-2

    sm:w-fit
    md:min-w-250
    md:px-10
    md:py-20
    lg:text-base
    xl:text-lg
`;

const actionIconClasses = "shrink-0 text-lg lg:text-xl xl:text-2xl";

/* =========================
   BACKDROP (art direction)
   One photo per orientation; the browser downloads only the one it shows.
========================= */

const { desktop, mobile } = restaurantConfig.hero.backdrop;
const backdropCommon = { alt: "", sizes: "100vw" };
const {
    props: { srcSet: desktopSrcSet },
} = getImageProps({ ...backdropCommon, ...desktop });
const {
    props: { srcSet: mobileSrcSet, ...backdropProps },
} = getImageProps({ ...backdropCommon, ...mobile });

const Hero = () => {
    return (
        <section
            aria-labelledby="hero-title"
            className="
                relative
                min-h-dvh
                w-full
                overflow-hidden
                bg-background
            "
        >
            <picture>
                <source media="(min-width: 48rem)" srcSet={desktopSrcSet} />
                <img
                    {...backdropProps}
                    srcSet={mobileSrcSet}
                    alt=""
                    fetchPriority="high"
                    loading="eager"
                    className="absolute inset-0 size-full object-cover"
                />
            </picture>

            {/* =========================
                HERO CONTENT
            ========================== */}

            {/* Mobile: spit is an absolute layer at the end side (left in RTL).
                md+: 12-column grid, content 7 cols (start) + spit 5 cols (end). */}
            <div className="relative grid min-h-dvh w-full grid-cols-1 px-page-gutter md:grid-cols-12 md:gap-x-40">
            <div
                className="
                    relative
                    z-10
                    flex
                    flex-col
                    items-start
                    justify-center
                    py-80

                    md:col-span-7
                    md:short:pt-104
                "
            >
                {/* Content Wrapper */}
                <div
                    className="
                        flex
                        w-full
                        max-w-3xl
                        flex-col
                        gap-10

                        lg:max-w-760
                        md:gap-20

                        xl:max-w-820
                    "
                >
                    {/* =========================
                        RESTAURANT NAME
                    ========================== */}

                    <div className="w-fit max-w-[65%] md:max-w-none">
                        <h1
                            className="
                                font-display
                                text-5xl
                                font-extrabold
                                leading-none

                                sm:text-6xl
                                md:text-7xl
                                lg:text-8xl
                                xl:text-9xl

                                md:short:text-6xl
                                lg:short:text-7xl
                            "
                        >
                            {restaurantConfig.name}
                        </h1>

                        <Underline />
                    </div>

                    {/* =========================
                        HEADLINE
                    ========================== */}

                    <h2
                        id="hero-title"
                        className="
                            max-w-[65%]
                            text-2xl
                            font-extrabold
                            leading-[1.4]

                            md:max-w-none

                            sm:text-3xl
                            md:text-4xl
                            lg:text-5xl
                        "
                    >
                        {restaurantConfig.hero.headline}
                    </h2>

                    {/* =========================
                        ACTION BUTTONS
                    ========================== */}

                    {/* Mobile: stacked, same width as the text block. sm+: side by side. */}
                    <div
                        className="
                            flex
                            w-full
                            max-w-[65%]
                            flex-col
                            gap-10

                            sm:w-fit
                            sm:max-w-none
                            sm:flex-row
                            sm:gap-12

                            lg:gap-20
                        "
                    >
                        {/* Primary Action */}
                        <Link
                            href={restaurantConfig.hero.primaryAction.href}
                            className={`${actionClasses} border-primary bg-primary text-background hover:brightness-110`}
                        >
                            <span>
                                {restaurantConfig.hero.primaryAction.label}
                            </span>

                            <FiArrowLeft className={actionIconClasses} />
                        </Link>

                        {/* Secondary Action */}
                        <Link
                            href={restaurantConfig.hero.secondaryAction.href}
                            className={`${actionClasses} border-2 border-foreground text-foreground hover:bg-foreground/10`}
                        >
                            <span>
                                {restaurantConfig.hero.secondaryAction.label}
                            </span>

                            <FiUser className={actionIconClasses} />
                        </Link>
                    </div>

                    {/* =========================
                        FEATURES
                    ========================== */}

                    <div
                        className="
                            mt-8
                            grid
                            w-full
                            grid-cols-3
                            items-start

                            sm:max-w-xl

                            md:mt-16

                            lg:mt-24
                            lg:max-w-none
                        "
                    >
                        {restaurantConfig.hero.features.map(
                            (feature, index) => {
                                const Icon = featureIcons[feature.icon];

                                return (
                                    <div
                                        key={feature.label}
                                        className={`
                                            flex
                                            min-w-0
                                            min-h-80
                                            md:min-h-120
                                            flex-col
                                            items-center
                                            justify-start
                                            gap-8
                                            px-8
                                            text-center

                                            lg:min-h-130
                                            lg:gap-12
                                            lg:px-20

                                            xl:px-28

                                            ${index !==
                                                restaurantConfig.hero.features
                                                    .length -
                                                1
                                                ? "border-e border-foreground/30"
                                                : ""
                                            }
                                        `}
                                    >
                                        {/* Feature Icon */}
                                        <Icon
                                            className="
                                                shrink-0
                                                text-3xl
                                                text-primary

                                                md:text-5xl
                                                lg:text-6xl
                                            "
                                        />

                                        {/* Feature Label */}
                                        <span
                                            className="
                                                text-[11px]
                                                font-semibold
                                                leading-relaxed
                                                text-foreground

                                                sm:text-xs
                                                md:text-base
                                                lg:text-lg
                                            "
                                        >
                                            {feature.label}
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>

            {/* =========================
                SHAWARMA
            ========================== */}

            {/* Phones: full screen height on the end side (left in RTL), half of it
                off screen, turning behind the text (owner's choice).
                md+: its own column, the full screen height from the very top
                (behind the see-through NavBar). */}
            <div
                className="
                    absolute
                    inset-y-0
                    inset-e-[-33dvh]
                    h-dvh

                    md:relative
                    md:inset-y-auto
                    md:bottom-auto
                    md:inset-e-auto
                    md:col-span-5
                    md:flex
                    md:h-auto
                    md:items-start
                    md:justify-center
                "
            >
                <div className="relative isolate h-full md:h-dvh">
                    {/* Warm glow behind the meat: separates it from the dark backdrop */}
                    <span
                        aria-hidden="true"
                        className="absolute inset-x-[-15%] inset-y-[15%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(255_138_0/0.3),transparent)] blur-2xl"
                    />
                    <HeroSpit image={restaurantConfig.hero.spit.image} motion={restaurantConfig.hero.spit.motion} />
                </div>
            </div>
            </div>

            {/* Fade the background into the next section (no hard edge). Above the spit, below the content. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-5 h-160 bg-linear-to-b from-transparent to-background"
            />
        </section>
    );
};

export default Hero;