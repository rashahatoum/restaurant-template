// Counts for the dashboard home tiles. Pure, so the same numbers work for the
// server seed today and the browser draft or the API later.

import type { DashboardData } from "@/types/dashboard";

export function dashboardSummary(data: DashboardData) {
    const { products, categories, offers, banners, reviews, ordering, siteInfo } = data;

    return {
        products: products.length,
        unavailable: products.filter((product) => !product.isAvailable).length,
        categories: categories.length,
        bestSellers: products.filter((product) => product.isBestSeller).length,
        offersEnabled: offers.isEnabled,
        activeOffers: offers.offers.filter((offer) => offer.isActive).length,
        activeBanners: banners.filter((banner) => banner.isActive).length,
        reviewsEnabled: reviews.isEnabled,
        visibleReviews: reviews.reviews.filter((review) => review.isVisible).length,
        deliveryFee: ordering.delivery.isEnabled ? ordering.delivery.fee : null,
        dineInBranches: ordering.dineIn.isEnabled
            ? ordering.dineIn.branches.filter((branch) => branch.isEnabled).length
            : 0,
        phones: siteInfo.phones.length,
        branches: siteInfo.branches.length,
    };
}
