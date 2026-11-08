// Everything the dashboard edits, unfiltered (hidden and inactive items
// included). From getDashboardSeed() today; from the Laravel admin endpoints later.

import type { AboutContent, HeroContent, MenuBanner, Offer, OffersContent, ReviewsContent, SiteInfo } from "@/types/content";
import type { Category, Product } from "@/types/menu";
import type { OrderingSettings } from "@/types/order";

/** What the dashboard sends to create or save a product (the API payload later): everything but the id. */
export type ProductInput = Omit<Product, "id">;

/** What the dashboard sends to create or save an offer: everything but the id. */
export type OfferInput = Omit<Offer, "id">;

/** What the dashboard sends to create or save a banner slide: everything but the id. */
export type BannerInput = Omit<MenuBanner, "id">;

/** The offers section's own settings (the offers list is edited one by one). */
export type OffersSettings = Pick<OffersContent, "isEnabled" | "eyebrow" | "title" | "menuCardImage">;

export interface DashboardData {
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
