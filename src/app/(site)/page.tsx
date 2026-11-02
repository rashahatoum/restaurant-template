import About from "@/components/home/About";
import BestSellers from "@/components/home/BestSellers";
import Hero from "@/components/home/Hero";
import Offers from "@/components/home/Offers";
import Reviews from "@/components/home/Reviews";
import RestaurantJsonLd from "@/components/seo/RestaurantJsonLd";
import { restaurantConfig } from "@/config/restaurant";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

// No title: the layout's default ("name | tagline") is the home title.
export const metadata: Metadata = pageMetadata({
    description: restaurantConfig.seo.description,
    path: "/",
});

const Home = () => {
    return (
        <main>
            <RestaurantJsonLd />
            <Hero />
            <BestSellers />
            <Offers />
            <About />
            <Reviews />
        </main>
    );
}

export default Home;
