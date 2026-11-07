import BannerForm from "@/components/dashboard/banner/BannerForm";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { restaurantConfig } from "@/config/restaurant";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "شريحة جديدة",
};

// Server page; the form is the client part. The slide background comes from
// config here, so the client form never imports restaurantConfig.
const NewBannerPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard/banner", label: "البانر" }}
                title="شريحة جديدة"
                description="عنوان قصير وصورة طبق، وزر إذا بدك. المعاينة بتوريك الشريحة متل ما رح تطلع."
            />

            <BannerForm seed={seed} background={restaurantConfig.hero.background} />
        </div>
    );
};

export default NewBannerPage;
