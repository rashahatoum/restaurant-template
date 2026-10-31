import type { RestaurantConfig } from "@/types/config";

export const restaurantConfig = {
    name: "أهل الكرم",
    logo: "/assets/imgs/ahl-alkaram-logo.webp",

    navbar: {
        links: [
            { label: "الرئيسية", href: "/" },
            { label: "القائمة", href: "/menu" },
            { label: "من نحن", href: "/#about" },
            { label: "موقعنا", href: "/#location" },
            { label: "تواصل معنا", href: "/#contact" },
        ],

        orderAction: {
            label: "اطلب الآن",
            href: "/menu",
        },
    },

    seo: {
        title: "شاورما بطعم أصيل",
        description:
            "أهل الكرم يقدم شاورما بطعم أصيل، مكونات طازجة يومياً وخلطة خاصة. تصفح القائمة واطلب مباشرة عبر واتساب.",

        keywords: [
            "أهل الكرم",
            "شاورما",
            "مطعم شاورما",
            "طلب شاورما",
            "مطعم",
            "وجبات",
            "فروج",
            "فروج مشوي",
            "كرسبي",
        ],
    },

    currency: {
        code: "SYP",
        label: "ل.س",
    },

    theme: "fire",

    hero: {
        badge: "من قلب السويداء",

        background: "/assets/imgs/fire-heroBg.webp",

        headline: "شاورما بطعم أصيل",

        primaryAction: {
            label: "اطلب الآن",
            href: "/menu",
        },

        secondaryAction: {
            label: "من نحن",
            href: "/#about",
        },

        backdrop: {
            desktop: { src: "/assets/imgs/hero/hero-bg.webp", width: 1672, height: 941 },
            mobile: { src: "/assets/imgs/hero/hero-bg-mobile.webp", width: 941, height: 1672 },
        },

        spit: {
            image: {
                src: "/assets/imgs/hero/shawarma_transparent.webp",
                alt: "سيخ شاورما جاج مشوي",
                width: 1024,
                height: 1536,
            },
            // Tuned with the owner in /lab/rotation.
            motion: { speed: 30, easeIn: 1, hold: 4, easeOut: 2.5 },
        },

        features: [
            {
                label: "مكونات طازجة يوميًا",
                icon: "fresh",
            },
            {
                label: "على الطريقة الشرقية الأصيلة",
                icon: "fire",
            },
            {
                label: "جودة عالية وسر المذاق",
                icon: "quality",
            },
        ],
    },
} as const satisfies RestaurantConfig;