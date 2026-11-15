import "server-only";

// The dashboard's starting data: every record as stored, nothing filtered.
// With API_BASE_URL set, the live areas come from the Laravel admin GETs
// (API-CONTRACT §4) and are saved there (D7): categories and products,
// offers, banners, reviews, hero + about, site info, ordering: every area. Without
// the API, everything is the mock data + the browser draft.
// Switching a new area = one entry in LIVE_LOADERS.

import { about } from "@/data/mock/about";
import { hero } from "@/data/mock/hero";
import { menuBanners } from "@/data/mock/menu-banners";
import { categories, products } from "@/data/mock/menu";
import { offers } from "@/data/mock/offers";
import { ordering } from "@/data/mock/ordering";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import { apiFetch } from "@/lib/api/client";
import { isApiEnabled } from "@/lib/api/config";
import type { Result } from "@/lib/api/errors";
import { DASHBOARD_HOME, sessionExpiredHref } from "@/lib/auth/paths";
import { toOffersContent, toReviewsContent } from "@/lib/dashboard/section-api";
import { numberBestSellers } from "@/lib/menu";
import type { AboutContent, HeroContent, MenuBanner, SiteInfo } from "@/types/content";
import type { DashboardData, LiveArea } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";
import type { OrderingSettings } from "@/types/order";
import { redirect } from "next/navigation";

/** An admin GET's data, or leave the page: 401 → sign in again; anything else → the dashboard's error page. */
function dataOrLeave<T>(result: Result<T>, what: string): T {
    if (result.ok) return result.data;
    // A page can't delete the cookie: the route does (D7a)
    if (result.error.kind === "unauthenticated") redirect(sessionExpiredHref(DASHBOARD_HOME));
    throw new Error(`GET /admin/${what} failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
}

/** An admin GET (token, never cached: the dashboard edits it). */
const adminGet = async <T>(what: string): Promise<T> => dataOrLeave(await apiFetch<T>(`/admin/${what}`, { auth: true }), what);

/** Without the API: the mock data (the browser draft takes over once the owner edits). */
function mockData(): DashboardData {
    return {
        categories: [...categories].sort((a, b) => a.order - b.order),
        // Numbered, so moves and undo in the dashboard always have a place to work with
        products: numberBestSellers(products),
        offers,
        banners: menuBanners,
        reviews,
        hero,
        about,
        siteInfo,
        ordering,
    };
}

/** Each live area's admin reads → its fields of DashboardData. */
const LIVE_LOADERS: Record<LiveArea, () => Promise<Partial<DashboardData>>> = {
    menu: async () => {
        const [apiCategories, apiProducts] = await Promise.all([adminGet<Category[]>("categories"), adminGet<Product[]>("products")]);
        // The API keeps best sellers numbered 1…n already
        return { categories: [...apiCategories].sort((a, b) => a.order - b.order), products: apiProducts };
    },
    offers: async () => ({ offers: toOffersContent(await adminGet<unknown>("offers")) }),
    banners: async () => ({ banners: await adminGet<MenuBanner[]>("banners") }),
    reviews: async () => ({ reviews: toReviewsContent(await adminGet<unknown>("reviews")) }),
    home: async () => {
        const [apiHero, apiAbout] = await Promise.all([adminGet<HeroContent>("hero"), adminGet<AboutContent>("about")]);
        return { hero: apiHero, about: apiAbout };
    },
    // Branch staff phones included (the admin GET has everything)
    info: async () => ({ siteInfo: await adminGet<SiteInfo>("site-info") }),
    // Every branch, even never set up (API-CONTRACT §4)
    ordering: async () => ({ ordering: await adminGet<OrderingSettings>("ordering") }),
};

export async function getDashboardSeed(): Promise<DashboardData> {
    const data = mockData();
    if (!isApiEnabled()) return data;

    const liveAreas = Object.keys(LIVE_LOADERS) as LiveArea[];
    const parts = await Promise.all(liveAreas.map((area) => LIVE_LOADERS[area]()));
    return Object.assign(data, ...parts, { liveAreas });
}
