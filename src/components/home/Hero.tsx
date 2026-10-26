import { restaurantConfig } from "@/config/restaurant";
import type { FeatureIconKey } from "@/types/config";
import Link from "next/link";

import type { IconType } from "react-icons";
import { FiArrowLeft, FiAward, FiUser } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { TiFeather } from "react-icons/ti";

import ShawarmaRotator from "./HeroImageSequence";

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

const Hero = () => {
    return (
        <section
            aria-labelledby="hero-title"
            style={{
                backgroundImage: `url(${restaurantConfig.hero.background})`,
            }}
            className="
                relative
                min-h-dvh
                w-full
                overflow-hidden
                bg-cover
                bg-center
                bg-no-repeat
            "
        >
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
                            "
                        >
                            {restaurantConfig.name}
                        </h1>

                        {/* Orange underline */}
                        <div
                            className="
                                mt-2
                                h-4
                                w-full
                                -rotate-3
                                rounded-full
                                bg-primary
                            "
                        />
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

            <div
                className="
                    absolute
                    inset-y-0
                    inset-e-[-15%]
                    flex
                    w-[75%]
                    justify-center

                    sm:w-[60%]

                    md:relative
                    md:inset-e-auto
                    md:col-span-5
                    md:w-auto
                "
            >
                <ShawarmaRotator />
            </div>
            </div>
        </section>
    );
};

export default Hero;