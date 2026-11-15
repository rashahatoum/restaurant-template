import About from "@/components/home/About";
import BestSellers from "@/components/home/BestSellers";
import Hero from "@/components/home/Hero";
import { AboutSkeleton, BestSellersSkeleton, OffersSkeleton, ReviewsSkeleton } from "@/components/home/HomeSkeletons";
import Offers from "@/components/home/Offers";
import Reviews from "@/components/home/Reviews";
import RestaurantJsonLd from "@/components/seo/RestaurantJsonLd";
import { restaurantConfig } from "@/config/restaurant";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

// No title: the layout's default ("name | tagline") is the home title.
export const metadata: Metadata = pageMetadata({
    description: restaurantConfig.seo.description,
    path: "/",
});

// Served prerendered; when it's rendered again (after a dashboard save, or an
// hourly refresh), each section below the hero streams in on its own, with a
// placeholder of its size meanwhile, instead of the whole page waiting.
const Home = () => {
    return (
        <main>
            <RestaurantJsonLd />
            <Hero />
            <Suspense fallback={<BestSellersSkeleton />}>
                <BestSellers />
            </Suspense>
            <Suspense fallback={<OffersSkeleton />}>
                <Offers />
            </Suspense>
            <Suspense fallback={<AboutSkeleton />}>
                <About />
            </Suspense>
            <Suspense fallback={<ReviewsSkeleton />}>
                <Reviews />
            </Suspense>
        </main>
    );
}

export default Home;
