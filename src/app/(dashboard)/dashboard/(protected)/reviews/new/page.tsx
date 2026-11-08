import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ReviewForm from "@/components/dashboard/reviews/ReviewForm";
import { restaurantConfig } from "@/config/restaurant";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "رأي جديد",
};

// Server page: passes the chat wallpaper (config) to the client form.
const NewReviewPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader back={{ href: "/dashboard/reviews", label: "الآراء" }} title="رأي جديد" />

            <ReviewForm seed={seed} wallpaper={restaurantConfig.reviews?.chatWallpaper} />
        </div>
    );
};

export default NewReviewPage;
