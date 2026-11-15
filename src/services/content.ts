// Editable page content. Same contract as services/menu.ts: each area reads
// the Laravel API once it's switched (D7) and API_BASE_URL is set, else the
// mock data, behind the same signatures. Offers are on the API (D7d); hero,
// about, reviews and site info are still mock.

import { about } from "@/data/mock/about";
import { hero } from "@/data/mock/hero";
import { offers } from "@/data/mock/offers";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import { apiFetch } from "@/lib/api/client";
import { isApiEnabled } from "@/lib/api/config";
import { publicPhones } from "@/lib/site-info";
import type {
    AboutContent,
    HeroContent,
    OffersContent,
    ReviewsContent,
    SiteInfo,
} from "@/types/content";
import { cache } from "react";

export async function getHeroContent(): Promise<HeroContent> {
    return hero;
}

export async function getSiteInfo(): Promise<SiteInfo> {
    return siteInfo;
}

/** The mobile menu's quick contact: first WhatsApp number, first phone, opening hours. */
export async function getNavContact(): Promise<{
    whatsAppNumber?: string;
    phoneNumber?: string;
    openingHours?: string;
}> {
    const { phones: allPhones, openingHours } = await getSiteInfo();
    const phones = publicPhones(allPhones);
    return {
        whatsAppNumber: phones.find((phone) => phone.hasWhatsApp)?.number,
        phoneNumber: phones[0]?.number,
        openingHours,
    };
}

export async function getAboutContent(): Promise<AboutContent> {
    return about;
}

/** Cache tag of the public offers read: a dashboard offers save calls updateTag(OFFERS_TAG). */
export const OFFERS_TAG = "offers";

/** Fallback refresh, for changes made on the server without the dashboard (API-CONTRACT §3). */
const OFFERS_REVALIDATE_SECONDS = 60 * 60;

/** Active offers only; null when the section is off or has nothing to show. */
const activeOffersOnly = (content: OffersContent | null): OffersContent | null => {
    if (!content?.isEnabled) return null;
    const activeOffers = content.offers.filter((offer) => offer.isActive);
    return activeOffers.length > 0 ? { ...content, offers: activeOffers } : null;
};

/**
 * Once per render (the home and the menu read it several times). With the
 * API: `GET /offers` (section + active offers, or null when the section is
 * off), cached with its tag. Throws when the API fails, like the menu: a
 * refresh keeps the last good page; never falls back to mock prices.
 */
const loadOffers = cache(async (): Promise<OffersContent | null> => {
    if (!isApiEnabled()) return activeOffersOnly(offers);

    const result = await apiFetch<OffersContent | null>("/offers", {
        next: { tags: [OFFERS_TAG], revalidate: OFFERS_REVALIDATE_SECONDS },
    });
    if (!result.ok) throw new Error(`GET /offers failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
    if (result.data !== null && !Array.isArray(result.data?.offers)) throw new Error("GET /offers didn't return the offers section");
    // The API already leaves inactive offers out; filtering again costs nothing
    return activeOffersOnly(result.data);
});

export async function getOffersContent(): Promise<OffersContent | null> {
    return loadOffers();
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
