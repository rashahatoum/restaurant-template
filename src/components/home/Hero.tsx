import { restaurantConfig } from "@/config/restaurant";
import type { FeatureIconKey } from "@/types/config";
import Link from "next/link";

import type { IconType } from "react-icons";
import { FiArrowLeft, FiAward } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
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

                    <div
                        className="
                            flex
                            w-fit
                            min-w-200
                            flex-col
                            gap-10

                            sm:max-w-xl
                            sm:flex-row
                            sm:gap-12

                            lg:max-w-none
                            lg:gap-20
                        "
                    >
                        {/* Primary Action */}
                        <Link
                            href={restaurantConfig.hero.primaryAction.href}
                            className="
                            flex
                            w-fit
                            min-w-168
                            md:min-w-250
                                items-center
                                justify-center
                                gap-8
                                rounded-full
                                bg-primary
                                px-20
                                py-10

                                md:px-10
                                md:py-20

                                text-sm
                                font-bold
                                text-background

                                transition-all
                                duration-300

                                hover:-translate-y-2
                                hover:brightness-110

                                lg:text-base

                                xl:text-lg
                            "
                        >
                            <span>
                                {restaurantConfig.hero.primaryAction.label}
                            </span>

                            <FaWhatsapp
                                className="
                                    shrink-0
                                    text-lg

                                    lg:text-xl
                                    xl:text-2xl
                                "
                            />
                        </Link>

                        {/* Secondary Action */}
                        <Link
                            href={restaurantConfig.hero.secondaryAction.href}
                            className="
                            flex
                            w-fit
                            min-w-100
                            md:min-w-250
                                items-center
                                justify-center
                                gap-8
                                rounded-full
                                bg-primary
                                px-20
                                py-10

                                md:px-10
                                md:py-20

                                text-sm
                                font-bold
                                text-background

                                transition-all
                                duration-300

                                hover:-translate-y-2
                                hover:brightness-110

                                lg:text-base

                                xl:text-lg
                            "
                        >
                            <span>
                                {restaurantConfig.hero.secondaryAction.label}
                            </span>

                            <FiArrowLeft
                                className="
                                    shrink-0
                                    text-lg

                                    lg:text-xl
                                    xl:text-2xl
                                "
                            />
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