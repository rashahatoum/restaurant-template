import BestSellersEditor from "@/components/dashboard/best-sellers/BestSellersEditor";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الأكثر مبيعاً",
};

// Server page; the list is the client part (the data lives in the browser draft).
const DashboardBestSellersPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="الأكثر مبيعاً"
                description="الأصناف اللي بتطلع بسلايدر «الأكثر مبيعاً» بالرئيسية، وبأي ترتيب. أول صنف بالقائمة هو أول واحد بالسلايدر."
            />

            <BestSellersEditor seed={seed} />
        </div>
    );
};

export default DashboardBestSellersPage;
