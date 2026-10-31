import { restaurantConfig } from "@/config/restaurant";
import type { FeatureIconKey } from "@/types/config";
import { getImageProps } from "next/image";
import Link from "next/link";

import type { IconType } from "react-icons";
import { FiArrowLeft, FiAward, FiMapPin, FiUser } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { TiFeather } from "react-icons/ti";

import HeroSpit from "@/components/motion/HeroSpit";
import Badge from "@/components/ui/Badge";
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
                    md:short:pb-40
                "
            >
                {/* Content Wrapper */}
                <div
                    className="
                        flex
                        w-full
                        max-w-3xl
                        flex-col
                        gap-14

                        lg:max-w-760
                        md:gap-20
                        md:short:gap-12

                        xl:max-w-820
                    "
                >
                    {/* =========================
                        BADGE (e.g. the city)
                    ========================== */}

                    {restaurantConfig.hero.badge && (
                        <div>
                            <Badge icon={FiMapPin}>{restaurantConfig.hero.badge}</Badge>
                        </div>
                    )}

                    {/* =========================
                        RESTAURANT NAME
                    ========================== */}

                    <div className="w-fit max-w-[70%] md:max-w-none">
                        <h1
                            className="
                                font-display
                                text-[3.5rem]
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

                    {/* Glass card: readable over anything behind it (on phones,
                        the spit's meat). Each icon sits in a soft orange disc. */}
                    <ul
                        className="
                            mt-12
                            grid
                            w-full
                            grid-cols-3
                            divide-x
                            divide-foreground/10
                            rounded-2xl
                            border
                            border-foreground/10
                            bg-background/60
                            shadow-[0_20px_50px_-25px_rgb(0_0_0/0.8)]
                            backdrop-blur-md

                            sm:max-w-xl

                            md:mt-20
                            md:rounded-3xl

                            lg:mt-28
                            lg:max-w-none

                            md:short:mt-8
                            lg:short:mt-8
                        "
                    >
                        {restaurantConfig.hero.features.map((feature) => {
                            const Icon = featureIcons[feature.icon];

                            return (
                                <li
                                    key={feature.label}
                                    className="
                                        flex
                                        min-w-0
                                        flex-col
                                        items-center
                                        gap-8
                                        px-6
                                        py-14
                                        text-center

                                        md:gap-12
                                        md:px-16
                                        md:py-20
                                        lg:py-24

                                        md:short:py-14
                                        lg:short:py-14
                                    "
                                >
                                    <span
                                        aria-hidden="true"
                                        className="
                                            flex
                                            size-40
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-primary/15
                                            text-xl
                                            text-primary

                                            md:size-56
                                            md:text-3xl
                                            lg:size-64

                                            md:short:size-48
                                            lg:short:size-48
                                            md:short:text-2xl
                                        "
                                    >
                                        <Icon />
                                    </span>

                                    <span
                                        className="
                                            text-xs
                                            font-bold
                                            leading-snug
                                            text-foreground

                                            sm:text-sm
                                            md:text-base
                                            lg:text-lg
                                        "
                                    >
                                        {feature.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* =========================
                SHAWARMA
            ========================== */}

            {/* Phones: full screen height on the end side (left in RTL), half of it
                off screen, turning behind the text (owner's choice).
                md+: its own column, the full screen height from the very top
                (behind the see-through NavBar), pushed toward the text so the
                middle of the hero isn't empty. */}
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
                {/* md+: nudged toward the text (the photo is wider than its column, so
                    aligning it to an edge would push the overflow the wrong way) */}
                <div className="relative isolate h-full md:h-dvh md:rtl:translate-x-[14%] md:ltr:-translate-x-[14%]">
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