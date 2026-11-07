import BannerForm from "@/components/dashboard/banner/BannerForm";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { restaurantConfig } from "@/config/restaurant";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تعديل شريحة",
};

interface EditBannerPageProps {
    params: Promise<{ id: string }>;
}

// Server page; the slide is looked up in the form (it may exist only in this browser's draft).
const EditBannerPage = async ({ params }: EditBannerPageProps) => {
    const [seed, { id }] = await Promise.all([getDashboardSeed(), params]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader back={{ href: "/dashboard/banner", label: "البانر" }} title="تعديل الشريحة" />

            <BannerForm seed={seed} background={restaurantConfig.hero.background} bannerId={id} />
        </div>
    );
};

export default EditBannerPage;
