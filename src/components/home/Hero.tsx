import { restaurantConfig } from "@/config/restaurant";
import Link from "next/link";

import { FiArrowLeft, FiAward } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { LuFlame } from "react-icons/lu";
import { TiFeather } from "react-icons/ti";

import ShawarmaRotator from "./HeroImageSequence";

/* =========================
   FEATURE ICONS
========================= */

const featureIcons = {
    fresh: TiFeather,
    fire: LuFlame,
    quality: FiAward,
};

const Hero = () => {
    return (
        <section
            aria-labelledby="hero-title"
            className="
                relative
                flex
                min-h-dvh
                w-full
                overflow-hidden
            "
        >
            {/* =========================
                HERO CONTENT
            ========================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    min-h-dvh
                    w-[80%]
                    flex-col
                    items-start
                    justify-center
                    ps-[8vw]
                    text-right

                    md:w-[62%]
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

                    <div className="w-fit">
                        <h1
                            className="
                                whitespace-nowrap
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
                            whitespace-nowrap
                            font-body
                            text-2xl
                            font-extrabold
                            leading-[1.4]

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

                                font-body
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

                                font-body
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
                                const Icon =
                                    featureIcons[
                                    feature.icon as keyof typeof featureIcons
                                    ];

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
                                                ? "border-l border-white/30"
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
                                                font-body
                                                text-[11px]
                                                font-semibold
                                                leading-relaxed
                                                text-white

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
                    left-40
                    top-0
                    w-[45%]

                    md:left-0
                "
            >
                <ShawarmaRotator />
            </div>
        </section>
    );
};

export default Hero;