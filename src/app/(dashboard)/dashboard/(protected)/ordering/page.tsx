import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import OrderingEditor from "@/components/dashboard/ordering/OrderingEditor";
import { restaurantConfig } from "@/config/restaurant";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الطلب والتوصيل",
};

// Server page: passes the restaurant name (config) for the message preview.
const DashboardOrderingPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="الطلب والتوصيل"
                description="وين بتوصل الطلبات وشو مكتوب فيها: التوصيل، الطاولات بكل فرع، ونص رسالة الواتساب."
            />

            <OrderingEditor seed={seed} restaurantName={restaurantConfig.name} />
        </div>
    );
};

export default DashboardOrderingPage;
