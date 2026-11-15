// Everything the dashboard edits, unfiltered (hidden and inactive items
// included). From getDashboardSeed() today; from the Laravel admin endpoints later.

import type { AboutContent, HeroContent, MenuBanner, Offer, OffersContent, Review, ReviewsContent, SiteInfo } from "@/types/content";
import type { Category, Product } from "@/types/menu";
import type { OrderingSettings } from "@/types/order";

/**
 * «رابط الصفحة» (API-CONTRACT §2): an optional readable link, which becomes the
 * record's id. Missing on create → a neutral id; missing on update → kept.
 */
export interface WithSlug {
    slug?: string;
}

/** What the dashboard sends to create or save a product: everything but the id, plus the optional link. */
export type ProductInput = Omit<Product, "id"> & WithSlug;

/** What the dashboard sends to create or save an offer: everything but the id, plus the optional link. */
export type OfferInput = Omit<Offer, "id"> & WithSlug;

/** Restaurant info as sent: a new branch (`id: ""`) may carry its link. */
export type SiteInfoInput = Omit<SiteInfo, "branches"> & { branches: readonly (SiteInfo["branches"][number] & WithSlug)[] };

/** What the dashboard sends to create or save a banner slide: everything but the id. */
export type BannerInput = Omit<MenuBanner, "id">;

/** What the dashboard sends to create or save a review: everything but the id. */
export type ReviewInput = Omit<Review, "id">;

/** The reviews section's own settings (the reviews are edited one by one). */
export type ReviewsSettings = Pick<ReviewsContent, "isEnabled" | "eyebrow" | "title" | "defaultQuestion">;

/** The offers section's own settings (the offers list is edited one by one). */
export type OffersSettings = Pick<OffersContent, "isEnabled" | "eyebrow" | "title" | "menuCardImage">;

/**
 * Dashboard areas that can live on the Laravel API (D7), switched one by one.
 * "menu" = categories + products (D7c); "offers" = the offers section + list;
 * "banners" = the menu banner slides; "reviews" = the reviews section + list;
 * "home" = the hero texts + «من نحن»; "info" = the restaurant info (phones, branches…);
 * "ordering" = delivery, tables and the message texts.
 */
export type LiveArea = "menu" | "offers" | "banners" | "reviews" | "home" | "info" | "ordering";

export interface DashboardData {
    /**
     * Set by the server for the areas that come from the Laravel API: the
     * dashboard saves those there and never takes them from the browser draft.
     * Absent or empty = everything in the draft, as before.
     */
    liveAreas?: readonly LiveArea[];
    categories: readonly Category[];
    products: readonly Product[];
    offers: OffersContent;
    banners: readonly MenuBanner[];
    reviews: ReviewsContent;
    hero: HeroContent;
    about: AboutContent;
    siteInfo: SiteInfo;
    ordering: OrderingSettings;
}
