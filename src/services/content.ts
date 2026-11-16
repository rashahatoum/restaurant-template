// Editable page content. Same contract as services/menu.ts: each area reads
// the Laravel API once it's switched (D7) and API_BASE_URL is set, else the
// mock data, behind the same signatures. Offers (D7d), reviews (D7f), hero and
// about (D7g), site info (D7h) are on the API.

import { about } from "@/data/mock/about";
import { hero } from "@/data/mock/hero";
import { offers } from "@/data/mock/offers";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import { apiFetch } from "@/lib/api/client";
import { isAreaLive } from "@/lib/api/config";
import { publicPhones } from "@/lib/site-info";
import type {
    AboutContent,
    HeroContent,
    OffersContent,
    ReviewsContent,
    SiteInfo,
} from "@/types/content";
import { cache } from "react";

/** Fallback refresh of the API reads, for changes made on the server without the dashboard (API-CONTRACT §3). */
const CONTENT_REVALIDATE_SECONDS = 60 * 60;

/** Cache tag of the hero and «من نحن» reads: a dashboard save of either calls updateTag(HOME_TAG). */
export const HOME_TAG = "home";

/** A public singleton read (`GET /hero`, `GET /about`), cached with its tag; throws when the API fails. */
async function readOne<T extends object>(path: string, tag: string): Promise<T> {
    const result = await apiFetch<T>(path, { next: { tags: [tag], revalidate: CONTENT_REVALIDATE_SECONDS } });
    if (!result.ok) throw new Error(`GET ${path} failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
    if (typeof result.data !== "object" || result.data === null) throw new Error(`GET ${path} didn't return an object`);
    return result.data;
}

export async function getHeroContent(): Promise<HeroContent> {
    return isAreaLive("home") ? readOne<HeroContent>("/hero", HOME_TAG) : hero;
}

/** Cache tag of the public site-info read: a dashboard site-info save calls updateTag(SITE_INFO_TAG). */
export const SITE_INFO_TAG = "site-info";

/**
 * The restaurant's info as customers see it (footer, JSON-LD, mobile menu).
 * With the API: `GET /site-info`, which leaves the branch staff phones out
 * (they're private). Once per render (several components read it).
 */
export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
    return isAreaLive("info") ? readOne<SiteInfo>("/site-info", SITE_INFO_TAG) : siteInfo;
});

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
    return isAreaLive("home") ? readOne<AboutContent>("/about", HOME_TAG) : about;
}

/** Cache tag of the public offers read: a dashboard offers save calls updateTag(OFFERS_TAG). */
export const OFFERS_TAG = "offers";


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
    if (!isAreaLive("offers")) return activeOffersOnly(offers);

    const result = await apiFetch<OffersContent | null>("/offers", {
        next: { tags: [OFFERS_TAG], revalidate: CONTENT_REVALIDATE_SECONDS },
    });
    if (!result.ok) throw new Error(`GET /offers failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
    if (result.data !== null && !Array.isArray(result.data?.offers)) throw new Error("GET /offers didn't return the offers section");
    // The API already leaves inactive offers out; filtering again costs nothing
    return activeOffersOnly(result.data);
});

export async function getOffersContent(): Promise<OffersContent | null> {
    return loadOffers();
}

/** Cache tag of the public reviews read: a dashboard reviews save calls updateTag(REVIEWS_TAG). */
export const REVIEWS_TAG = "reviews";

/** Visible reviews only; null when the section is off or has nothing to show. */
const visibleReviewsOnly = (content: ReviewsContent | null): ReviewsContent | null => {
    if (!content?.isEnabled) return null;
    const visibleReviews = content.reviews.filter((review) => review.isVisible);
    return visibleReviews.length > 0 ? { ...content, reviews: visibleReviews } : null;
};

/** With the API: `GET /reviews` (section + visible reviews, or null when off), cached with its tag; throws on failure. */
export async function getReviewsContent(): Promise<ReviewsContent | null> {
    if (!isAreaLive("reviews")) return visibleReviewsOnly(reviews);

    const result = await apiFetch<ReviewsContent | null>("/reviews", {
        next: { tags: [REVIEWS_TAG], revalidate: CONTENT_REVALIDATE_SECONDS },
    });
    if (!result.ok) throw new Error(`GET /reviews failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
    if (result.data !== null && !Array.isArray(result.data?.reviews)) throw new Error("GET /reviews didn't return the reviews section");
    return visibleReviewsOnly(result.data);
}
