import "server-only";

// The dashboard's starting data: every record as stored, nothing filtered.
// Today the mock data; later the Laravel admin GET endpoints (API-CONTRACT §4),
// with the same return type.

import { about } from "@/data/mock/about";
import { menuBanners } from "@/data/mock/menu-banners";
import { categories, products } from "@/data/mock/menu";
import { offers } from "@/data/mock/offers";
import { ordering } from "@/data/mock/ordering";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardSeed(): Promise<DashboardData> {
    return {
        categories: [...categories].sort((a, b) => a.order - b.order),
        products,
        offers,
        banners: menuBanners,
        reviews,
        about,
        siteInfo,
        ordering,
    };
}
