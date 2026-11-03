// Everything the dashboard edits, unfiltered (hidden and inactive items
// included). From getDashboardSeed() today; from the Laravel admin endpoints later.

import type { AboutContent, MenuBanner, OffersContent, ReviewsContent, SiteInfo } from "@/types/content";
import type { Category, Product } from "@/types/menu";
import type { OrderingSettings } from "@/types/order";

export interface DashboardData {
    categories: readonly Category[];
    products: readonly Product[];
    offers: OffersContent;
    banners: readonly MenuBanner[];
    reviews: ReviewsContent;
    about: AboutContent;
    siteInfo: SiteInfo;
    ordering: OrderingSettings;
}
