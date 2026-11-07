import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import OffersEditor from "@/components/dashboard/offers/OffersEditor";
import { readNotice } from "@/lib/dashboard/notice";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "العروض",
};

interface DashboardOffersPageProps {
    searchParams: Promise<{ done?: string; name?: string }>;
}

// The offers section and its list. The offer form comes back here with
// ?done=&name= (validated before use).
const DashboardOffersPage = async ({ searchParams }: DashboardOffersPageProps) => {
    const [seed, { done, name }] = await Promise.all([getDashboardSeed(), searchParams]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="العروض"
                description="العروض بتطلع بسلايدر بالرئيسية وكقسم أول بالمنيو. وقّف العرض بدل ما تحذفه إذا راجع."
            />

            <OffersEditor seed={seed} notice={readNotice(done, name)} />
        </div>
    );
};

export default DashboardOffersPage;
