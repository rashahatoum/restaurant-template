// Editable page content. Same contract as services/menu.ts: async today over
// mock data, later the dashboard/API behind the same signatures.

import { about } from "@/data/mock/about";
import { menuBanners } from "@/data/mock/menu-banners";
import { offers } from "@/data/mock/offers";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import type {
    AboutContent,
    MenuBanner,
    OffersContent,
    ReviewsContent,
    SiteInfo,
} from "@/types/content";

export async function getSiteInfo(): Promise<SiteInfo> {
    return siteInfo;
}

/** The mobile menu's quick contact: first WhatsApp number, first phone, opening hours. */
export async function getNavContact(): Promise<{
    whatsAppNumber?: string;
    phoneNumber?: string;
    openingHours?: string;
}> {
    const { phones, openingHours } = await getSiteInfo();
    return {
        whatsAppNumber: phones.find((phone) => phone.hasWhatsApp)?.number,
        phoneNumber: phones[0]?.number,
        openingHours,
    };
}

export async function getAboutContent(): Promise<AboutContent> {
    return about;
}

/** Active menu banner slides, in order (may be empty: the page then hides the banner). */
export async function getMenuBanners(): Promise<readonly MenuBanner[]> {
    return menuBanners.filter((banner) => banner.isActive);
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
