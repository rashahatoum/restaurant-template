import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ReviewForm from "@/components/dashboard/reviews/ReviewForm";
import { restaurantConfig } from "@/config/restaurant";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تعديل رأي",
};

interface EditReviewPageProps {
    params: Promise<{ id: string }>;
}

// Server page; the review is looked up in the form (it may exist only in this browser's draft).
const EditReviewPage = async ({ params }: EditReviewPageProps) => {
    const [seed, { id }] = await Promise.all([getDashboardSeed(), params]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader back={{ href: "/dashboard/reviews", label: "الآراء" }} title="تعديل الرأي" />

            <ReviewForm seed={seed} wallpaper={restaurantConfig.reviews?.chatWallpaper} reviewId={id} />
        </div>
    );
};

export default EditReviewPage;
