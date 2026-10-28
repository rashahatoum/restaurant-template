// Editable page content. Same contract as services/menu.ts: async today over
// mock data, later the dashboard/API behind the same signatures.

import { about } from "@/data/mock/about";
import { offers } from "@/data/mock/offers";
import type { AboutContent, OffersContent } from "@/types/content";

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
