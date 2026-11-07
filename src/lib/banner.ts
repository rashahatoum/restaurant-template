// Banner button targets → links. Pure, so the public menu (services) and the
// dashboard (row notes, preview) decide the same way what still exists.

import { categoryAnchor, OFFERS_ANCHOR } from "@/lib/menu";
import type { BannerTarget } from "@/types/content";

/** What a banner button may point at right now (what customers can reach). */
export interface BannerTargets {
    /** The offers section is on and has an active offer. */
    hasOffers: boolean;
    /** Categories shown on the menu (empty ones are left out). */
    categoryIds: ReadonlySet<string>;
    /** Products shown on the menu. */
    productIds: ReadonlySet<string>;
}

/** The button's link, or undefined when its target is gone (the button hides). */
export function bannerHref(target: BannerTarget, targets: BannerTargets): string | undefined {
    switch (target.kind) {
        case "offers":
            return targets.hasOffers ? `#${OFFERS_ANCHOR}` : undefined;
        case "category":
            return targets.categoryIds.has(target.categoryId) ? `#${categoryAnchor(target.categoryId)}` : undefined;
        case "product":
            return targets.productIds.has(target.productId) ? `/menu/${target.productId}` : undefined;
    }
}
