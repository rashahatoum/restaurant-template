// Mock hero texts for Ahl Al Karam. Only src/services/ may import this file.

import type { HeroContent } from "@/types/content";

export const hero: HeroContent = {
    badge: "من قلب السويداء",
    headline: "شاورما بطعم أصيل",
    primaryActionLabel: "اطلب الآن",
    secondaryActionLabel: "من نحن",
    features: [
        { label: "مكونات طازجة يوميًا", icon: "fresh" },
        { label: "على الطريقة الشرقية الأصيلة", icon: "fire" },
        { label: "جودة عالية وسر المذاق", icon: "quality" },
    ],
};
