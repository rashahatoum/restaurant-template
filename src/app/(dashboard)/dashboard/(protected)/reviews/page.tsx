import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ReviewsEditor from "@/components/dashboard/reviews/ReviewsEditor";
import { readNotice } from "@/lib/dashboard/notice";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الآراء",
};

interface DashboardReviewsPageProps {
    searchParams: Promise<{ done?: string; name?: string }>;
}

// The reviews section and its list. The review form comes back here with
// ?done=&name= (validated before use).
const DashboardReviewsPage = async ({ searchParams }: DashboardReviewsPageProps) => {
    const [seed, { done, name }] = await Promise.all([getDashboardSeed(), searchParams]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="الآراء"
                description="آراء الزباين اللي وصلتك على واتساب، بتطلع كمحادثات صغيرة بالرئيسية. خبّي الرأي بدل ما تحذفه إذا بدك ترجعه."
            />

            <ReviewsEditor seed={seed} notice={readNotice(done, name)} />
        </div>
    );
};

export default DashboardReviewsPage;
