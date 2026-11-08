import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import SiteInfoEditor from "@/components/dashboard/info/SiteInfoEditor";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "معلومات المطعم",
};

// Server page; the form is the client part (the data lives in the browser draft).
const DashboardInfoPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="معلومات المطعم"
                description="كل شي بيطلع بالفوتر: التعريف، صفحات السوشال، الأرقام، الفروع وأوقات العمل."
            />

            <SiteInfoEditor seed={seed} />
        </div>
    );
};

export default DashboardInfoPage;
