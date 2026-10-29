// Mock menu page banner slides. Only src/services/ may import this file.
// Reuses the offer and dish photos; the owner will manage slides from the dashboard.
// "#category-offers" only exists while the offers section is on: turn off
// slides that point to it when offers are disabled.

import type { MenuBanner } from "@/types/content";

export const menuBanners: readonly MenuBanner[] = [
    {
        id: "shawarma-4-plus-1",
        eyebrow: "عرض الأسبوع",
        title: "كل 4 شاورما\n+ وحدة مجاناً",
        image: {
            src: "/assets/imgs/offers/shawarma-4-plus-1.webp",
            alt: "سندويشات شاورما",
        },
        action: { label: "شوف العروض", href: "#category-offers" },
        isActive: true,
    },
    {
        id: "grilled-chicken",
        eyebrow: "الأكثر طلباً",
        title: "فروج\nالشوارية",
        image: {
            src: "/assets/imgs/menu/grilled-chicken.webp",
            alt: "فروج مشوي",
        },
        action: { label: "اطلب الآن", href: "#category-chicken" },
        isActive: true,
    },
    {
        id: "chicken-cola",
        eyebrow: "عرض الفروج",
        title: "مع كل فروج\nلتر ببسي مجاناً",
        image: {
            src: "/assets/imgs/offers/chicken-cola.webp",
            alt: "فروج مشوي مع مشروب",
        },
        action: { label: "شوف العروض", href: "#category-offers" },
        isActive: true,
    },
];
