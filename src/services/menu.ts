// Menu data access. One loader, two sources: with API_BASE_URL set, the
// Laravel `GET /menu` (API-CONTRACT §3); unset, the mock data. Everything
// below is built from it, so callers don't change. Offers stay on mock data.

import { categories, products } from "@/data/mock/menu";
import { menuBanners } from "@/data/mock/menu-banners";
import { apiFetch } from "@/lib/api/client";
import { isApiEnabled } from "@/lib/api/config";
import { bannerHref } from "@/lib/banner";
import { offerKey } from "@/lib/cart";
import { sortBestSellers, toMenuItemDetails } from "@/lib/menu";
import { getOffersContent } from "@/services/content";
import type { MenuBannerSlideData } from "@/types/content";
import type { MenuItemDetails, MenuSection, Product } from "@/types/menu";
import { cache } from "react";

/** A product that has a photo (required where the image is the focus, e.g. best sellers). */
export type ProductWithImage = Product & { image: string };

/** Cache tag of every menu read: a dashboard save calls revalidateTag(MENU_TAG). */
export const MENU_TAG = "menu";

/** Fallback refresh, for changes made on the server without the dashboard (API-CONTRACT §3). */
const MENU_REVALIDATE_SECONDS = 60 * 60;

/** Same shape as the API: categories in order, each with its products; empty ones left out. */
function mockMenu(): MenuSection[] {
    return [...categories]
        .sort((a, b) => a.order - b.order)
        .map((category) => ({
            category,
            products: products.filter((product) => product.categoryId === category.id),
        }))
        .filter((section) => section.products.length > 0);
}

/**
 * The menu, once per render (React cache: the menu page reads it for the list
 * and again for the banner targets). Across pages and builds, Next's Data
 * Cache shares one `GET /menu` (tag + time-based fallback), so the build's
 * page-per-product doesn't hit the API's 300-a-minute limit.
 *
 * Throws when the API fails, on purpose: a background refresh then keeps the
 * last good page, a build fails (Vercel keeps the live deployment), and only
 * a page with no good copy shows the menu's error.tsx. Never falls back to
 * mock data: customers would see old prices.
 */
const loadMenu = cache(async (): Promise<readonly MenuSection[]> => {
    if (!isApiEnabled()) return mockMenu();

    const result = await apiFetch<MenuSection[]>("/menu", {
        next: { tags: [MENU_TAG], revalidate: MENU_REVALIDATE_SECONDS },
    });
    if (!result.ok) throw new Error(`GET /menu failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
    if (!Array.isArray(result.data)) throw new Error("GET /menu didn't return a list");
    return result.data;
});

/**
 * Categories in display order, each with its products (unavailable ones
 * included, shown as such). Empty categories are left out.
 */
export async function getMenu(): Promise<readonly MenuSection[]> {
    return loadMenu();
}

/**
 * A product (shown in the menu) or an active offer, for its details page.
 * null when the id is unknown, the product's category is hidden, or the offer is off.
 */
export async function getMenuItem(id: string): Promise<MenuItemDetails | null> {
    const sections = await getMenu();
    const product = sections
        .flatMap((section) => section.products)
        .find((candidate) => candidate.id === id);

    if (product) return toMenuItemDetails(product);

    const offer = (await getOffersContent())?.offers.find((candidate) => candidate.id === id);
    if (!offer) return null;

    return {
        id: offer.id,
        kind: "offer",
        itemKey: offerKey(offer.id),
        name: offer.title,
        image: offer.image,
        imageStyle: offer.imageStyle,
        price: offer.price,
        parts: offer.items,
        freeItem: offer.freeItem,
        badge: offer.badge,
        isAvailable: true,
    };
}

/** Every id that has a details page (for static generation). */
export async function getMenuItemIds(): Promise<string[]> {
    const [sections, offers] = await Promise.all([getMenu(), getOffersContent()]);
    return [
        ...sections.flatMap((section) => section.products.map((product) => product.id)),
        ...(offers?.offers.map((offer) => offer.id) ?? []),
    ];
}

/**
 * Active menu banner slides, in order, each button resolved to a link (may be
 * empty: the page then hides the banner). A button whose target is gone
 * (offers off, category empty or deleted, product gone) is dropped; the slide stays.
 */
export async function getMenuBanners(): Promise<readonly MenuBannerSlideData[]> {
    const [sections, offers] = await Promise.all([getMenu(), getOffersContent()]);
    const targets = {
        hasOffers: offers !== null,
        categoryIds: new Set(sections.map((section) => section.category.id)),
        productIds: new Set(sections.flatMap((section) => section.products.map((product) => product.id))),
    };

    return menuBanners
        .filter((banner) => banner.isActive)
        .map(({ action, ...banner }) => {
            const href = action && bannerHref(action.target, targets);
            return action && href ? { ...banner, action: { label: action.label, href } } : banner;
        });
}

/** Available best sellers that have a photo (the slider shows the dish), in the owner's order. */
export async function getBestSellers(): Promise<readonly ProductWithImage[]> {
    const shown = (await loadMenu()).flatMap((section) => section.products);
    return sortBestSellers(shown).filter(
        (product): product is ProductWithImage =>
            product.isBestSeller &&
            product.isAvailable &&
            Boolean(product.image)
    );
}
