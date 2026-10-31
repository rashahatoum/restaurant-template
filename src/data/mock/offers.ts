// Mock offers for Ahl Al Karam. Only src/services/ may import this file.
// Prices are placeholders; the owner will set real ones from the dashboard.

import type { OffersContent } from "@/types/content";

const IMAGES_PATH = "/assets/imgs/offers";

export const offers: OffersContent = {
    isEnabled: true,
    eyebrow: "عروض أهل الكرم",
    title: "الكرم **بالعروض**",
    menuCardImage: "/assets/imgs/categories/offers.webp",
    offers: [
        {
            id: "chicken-cola",
            title: "عرض الفروج",
            items: ["فروج مشوي", "بطاطا", "ثوم"],
            freeItem: "لتر ببسي",
            price: 1250,
            image: `${IMAGES_PATH}/chicken-cola.webp`,
            isActive: true,
        },
        {
            id: "shawarma-4-plus-1",
            title: "عرض 4+1",
            items: ["4 سندويشات شاورما جاج"],
            freeItem: "سندويشة شاورما خامسة",
            price: 1000,
            image: `${IMAGES_PATH}/shawarma-4-plus-1.webp`,
            badge: "الأكثر طلباً",
            isActive: true,
        },
        {
            id: "crispy-duo",
            title: "ثنائي الكرسبي",
            items: ["2 وجبة كرسبي"],
            freeItem: "سندويشة شاورما",
            price: 1100,
            image: `${IMAGES_PATH}/crispy-duo.webp`,
            isActive: true,
        },
        {
            id: "shawarma-fries-duo",
            title: "ثنائي الشاورما",
            items: ["2 سندويشة شاورما جاج"],
            freeItem: "سندويشة بطاطا",
            price: 500,
            image: `${IMAGES_PATH}/shawarma-fries-duo.webp`,
            isActive: true,
        },
    ],
};
