import type { RestaurantConfig } from "@/types/config";

export const restaurantConfig = {
    name: "أهل الكرم",
    logo: "/assets/imgs/ahl-alkaram-logo.webp",

    navbar: {
        mobileBackground: "/assets/imgs/nav-mobile-bg.webp",

        // icon: key mapped to a component in NavBar (navIcons)
        links: [
            { label: "الرئيسية", href: "/", icon: "home" },
            { label: "القائمة", href: "/menu", icon: "menu" },
            { label: "من نحن", href: "/#about", icon: "about" },
            { label: "موقعنا", href: "/#location", icon: "location" },
            { label: "تواصل معنا", href: "/#contact", icon: "contact" },
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

        media: {
            type: "image-sequence",

            animation: {
                framesPath:"/assets/imgs/shawarma-sequence",
                filePrefix: "shawarma",
                fileExtension: "webp",

                frameStep: 15,

                startAngle: 0,
                endAngle: 180,

                frameDuration: 300,

                autoPlay: true,
                autoPlayDelay: 300,

                interaction: {
                    hover: true,
                    click: true,
                },
            },

            image: {
                    alt: "سيخ شاورما مشوي",
                    width: 1024,
                    height: 1536,
            },
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