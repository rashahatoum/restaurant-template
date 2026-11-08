import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import HomeContentEditor from "@/components/dashboard/home-content/HomeContentEditor";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الواجهة و«من نحن»",
};

// Server page; the two forms are the client part (the data lives in the browser draft).
const DashboardHomeContentPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="الواجهة و«من نحن»"
                description="نصوص أول الصفحة الرئيسية وقسم «من نحن». كل قسم إلو زر حفظ لحاله."
            />

            <HomeContentEditor seed={seed} />
        </div>
    );
};

export default DashboardHomeContentPage;
