// Editable page content. Same contract as services/menu.ts: async today over
// mock data, later the dashboard/API behind the same signatures.

import { about } from "@/data/mock/about";
import { offers } from "@/data/mock/offers";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import type {
    AboutContent,
    OffersContent,
    ReviewsContent,
    SiteInfo,
} from "@/types/content";

export async function getSiteInfo(): Promise<SiteInfo> {
    return siteInfo;
}

export async function getAboutContent(): Promise<AboutContent> {
    return about;
}

/** Active offers only; null when the section is off or has nothing to show. */
export async function getOffersContent(): Promise<OffersContent | null> {
    if (!offers.isEnabled) return null;

    const activeOffers = offers.offers.filter((offer) => offer.isActive);

    return activeOffers.length > 0
        ? { ...offers, offers: activeOffers }
        : null;
}

/** Visible reviews only; null when the section is off or has nothing to show. */
export async function getReviewsContent(): Promise<ReviewsContent | null> {
    if (!reviews.isEnabled) return null;

    const visibleReviews = reviews.reviews.filter(
        (review) => review.isVisible
    );

    return visibleReviews.length > 0
        ? { ...reviews, reviews: visibleReviews }
        : null;
}
