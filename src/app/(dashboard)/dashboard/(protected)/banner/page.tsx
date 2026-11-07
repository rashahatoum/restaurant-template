import BannerEditor from "@/components/dashboard/banner/BannerEditor";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { readNotice } from "@/lib/dashboard/notice";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "بانر المنيو",
};

interface DashboardBannerPageProps {
    searchParams: Promise<{ done?: string; name?: string }>;
}

// The menu banner's slides. The slide form comes back here with ?done=&name=.
const DashboardBannerPage = async ({ searchParams }: DashboardBannerPageProps) => {
    const [seed, { done, name }] = await Promise.all([getDashboardSeed(), searchParams]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="بانر المنيو"
                description="الشرائح اللي بتتقلّب بأول صفحة المنيو: عرض، طبق مميّز، أو خبر. كل شريحة إلها زر بيودّي على العروض أو قسم أو صنف."
            />

            <BannerEditor seed={seed} notice={readNotice(done, name)} />
        </div>
    );
};

export default DashboardBannerPage;
